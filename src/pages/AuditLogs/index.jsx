import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Clock, 
  Terminal, 
  Eye, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertTriangle,
  Activity,
  Wifi,
  UserCheck,
  BarChart2,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [limit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Stats / Telemetry states
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Detailed view modal state
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit', {
        params: {
          limit,
          offset,
          search,
          severity: selectedSeverity || null,
          action: selectedAction || null
        }
      });
      setLogs(res.data.logs || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Failed to load audit logs:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/audit/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load compliance stats:', err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [offset, limit, selectedSeverity, selectedAction]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    setOffset(0);
    fetchLogs();
    fetchStats();
  };

  const getSeverityVariant = (severity) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'warning': return 'warning';
      default: return 'info';
    }
  };

  const openDetails = (log) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  // Pagination helper
  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handlePrevPage = () => {
    if (offset > 0) setOffset(offset - limit);
  };

  const handleNextPage = () => {
    if (offset + limit < totalCount) setOffset(offset + limit);
  };

  // Calculate maximum event count in timeline to scale chart bars
  const maxTimelineCount = stats?.eventTimeline 
    ? Math.max(...stats.eventTimeline.map(d => d.count), 5) 
    : 10;

  return (
    <div className="flex flex-col gap-8 transition-colors duration-300">
      {/* Visual background glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/[0.01] rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col gap-1.5 flex-wrap md:flex-row md:items-end justify-between z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white uppercase leading-none">
            Audit <span className="text-blue-500 font-extrabold">Logs</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Immutable log ledger capturing all cryptographic operations, security accesses, and auth transactions.
          </p>
        </div>
        <Badge variant="success" className="h-6 mt-2 md:mt-0 font-bold shrink-0">
          <Database size={12} className="mr-1.5" /> Compliance Active
        </Badge>
      </div>

      {/* Analytics telemetry overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 z-10">
        <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Operations</span>
            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight mt-0.5">
              {loadingStats ? '...' : stats?.totalEvents || 0}
            </span>
          </div>
        </Card>

        <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0 animate-pulse">
            <ShieldAlert size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Critical Alerts</span>
            <span className="text-xl font-black text-red-500 dark:text-red-400 tracking-tight mt-0.5">
              {loadingStats ? '...' : stats?.severityBreakdown?.critical || 0}
            </span>
          </div>
        </Card>

        <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
            <UserCheck size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Credentials</span>
            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight mt-0.5">
              {loadingStats ? '...' : stats?.activeUsersCount || 0}
            </span>
          </div>
        </Card>

        <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
            <Wifi size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Requester IPs</span>
            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight mt-0.5">
              {loadingStats ? '...' : stats?.topIps?.length || 0}
            </span>
          </div>
        </Card>
      </div>

      {/* Telemetry charts & threat dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10">
        
        {/* SVG/CSS Bespoke timeline chart */}
        <Card className="lg:col-span-2 glass-card-dark not-dark:glass-card-light rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <BarChart2 className="text-blue-500" size={15} />
            <span>Compliance Events Timeline (Last 7 Days)</span>
          </h3>

          {loadingStats ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Generating Chart...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-5 mt-2">
              {/* Bespoke CSS Bar chart */}
              <div className="flex items-end justify-between h-[160px] bg-slate-950/20 dark:bg-slate-950/40 border border-slate-200/60 dark:border-white/5 rounded-xl p-4 pt-8 gap-3 relative">
                {stats?.eventTimeline?.map((day) => {
                  const percentageHeight = (day.count / maxTimelineCount) * 100;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end relative">
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-1 bg-slate-900 border border-slate-700 text-white text-[8px] font-mono p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {day.count} events
                      </div>
                      
                      {/* The Bar */}
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-cyan-400 rounded-md transition-all duration-500 shadow-md shadow-blue-500/10 min-h-[4px]"
                        style={{ height: `${percentageHeight}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between px-2 text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase">
                {stats?.eventTimeline?.map((day) => {
                  const parts = day.date.split('-');
                  return (
                    <span key={day.date} className="text-center w-full">
                      {parts[1]}/{parts[2]}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Severity breakdowns & Risk levels */}
        <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="text-indigo-500" size={15} />
            <span>Risk Level & Threat Distribution</span>
          </h3>

          {loadingStats ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auditing Severity...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-4.5 justify-center h-full">
              {/* Progress 1: Critical */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-red-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                    Critical Incident alerts
                  </span>
                  <span className="text-slate-400">{stats?.severityBreakdown?.critical || 0}</span>
                </div>
                <div className="w-full h-2 bg-slate-300 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${(stats?.severityBreakdown?.critical / (stats?.totalEvents || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress 2: Warning */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-yellow-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></span>
                    Warning events
                  </span>
                  <span className="text-slate-400">{stats?.severityBreakdown?.warning || 0}</span>
                </div>
                <div className="w-full h-2 bg-slate-300 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${(stats?.severityBreakdown?.warning / (stats?.totalEvents || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Progress 3: Info */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider">
                  <span className="text-blue-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                    Standard Information
                  </span>
                  <span className="text-slate-400">{stats?.severityBreakdown?.info || 0}</span>
                </div>
                <div className="w-full h-2 bg-slate-300 dark:bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(stats?.severityBreakdown?.info / (stats?.totalEvents || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Immutable ledger log list query card */}
      <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-5 flex flex-col gap-5 z-10">
        
        {/* Filter controls form */}
        <form onSubmit={handleQuerySubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search secure database (Action, Email, IP, Details)..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex gap-3.5 shrink-0">
            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>

            {/* Action Filter */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="">All Actions</option>
              <option value="AUTH_LOGIN_SUCCESS">Login Success</option>
              <option value="AUTH_LOGIN_FAILED">Login Failed</option>
              <option value="AUTH_LOGOUT">Logout</option>
              <option value="FILE_UPLOAD">File Upload</option>
              <option value="FILE_DOWNLOAD">File Download</option>
              <option value="FILE_PREVIEW">File View</option>
              <option value="FILE_DELETE">File Delete</option>
              <option value="SHARE_GRANT">Share Grant</option>
              <option value="SHARE_LINK_GENERATE">Share Link Generate</option>
              <option value="SHARE_REVOKE">Share Revoked</option>
              <option value="MALWARE_DETECTED">Malware Detected</option>
            </select>

            <Button type="submit" variant="secondary" className="px-5 font-bold flex gap-2">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Query Ledger</span>
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500"></div>
            <span className="text-[10px] font-bold text-slate-450 tracking-widest uppercase">Querying Safe Records...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <ShieldAlert className="text-slate-300 dark:text-white/5 mb-4 shrink-0" size={44} />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              No Audit Records Matched
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 font-medium">
              Ensure you have input the correct queries, or that database tables hold logged events.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Logs table */}
            <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-xl">
              <table className="w-full text-left border-collapse bg-slate-200/10 dark:bg-[#000000]/10">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 text-[9px] text-slate-450 dark:text-slate-450 uppercase font-bold tracking-widest">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Security Action</th>
                    <th className="py-3 px-4">Target User</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs font-mono text-slate-700 dark:text-slate-350">
                  {logs.map((log) => (
                    <tr 
                      key={log.id} 
                      className="hover:bg-slate-200/20 dark:hover:bg-white/[0.01] transition-colors duration-200"
                    >
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[10px] whitespace-nowrap">
                        <span className="flex items-center gap-1.5 font-sans font-semibold">
                          <Clock size={12} className="text-slate-450" />
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-white text-[10px]">
                        {log.action}
                      </td>
                      <td className="py-3.5 px-4 text-blue-500 dark:text-cyan-400 font-bold font-sans">
                        {log.user_email || 'GUEST / UNAUTH'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-550 dark:text-slate-400 font-bold">
                        {log.ip_address}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={getSeverityVariant(log.severity)}>
                          {log.severity}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <button
                          onClick={() => openDetails(log)}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg border border-slate-200 hover:border-blue-500 dark:border-white/10 dark:hover:border-blue-500/20 bg-slate-100 hover:bg-blue-500/5 dark:bg-transparent dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-350 hover:text-blue-500 dark:hover:text-cyan-400 transition-all ml-auto"
                        >
                          <Eye size={12} className="inline mr-1" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-4">
              <span className="text-[10px] uppercase font-bold text-slate-450 dark:text-slate-500 tracking-wider">
                Showing logs {offset + 1} - {Math.min(offset + limit, totalCount)} of {totalCount}
              </span>
              
              <div className="inline-flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                  className="px-3 py-1 flex items-center gap-1 font-bold text-xs"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </Button>
                
                <span className="flex items-center px-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={offset + limit >= totalCount}
                  className="px-3 py-1 flex items-center gap-1 font-bold text-xs"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Inspect Log details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Security Audit Transaction Detail"
        size="lg"
      >
        {selectedLog && (
          <div className="flex flex-col gap-5 text-slate-800 dark:text-white">
            <div className="grid grid-cols-2 gap-4 bg-slate-200/40 dark:bg-white/[0.02] border border-slate-250/60 dark:border-white/5 p-4 rounded-xl text-xs leading-relaxed">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Transaction Index</span>
                <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">#{selectedLog.id}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Timestamp</span>
                <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{new Date(selectedLog.created_at).toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Operation Action</span>
                <span className="font-mono font-black text-blue-600 dark:text-cyan-400">{selectedLog.action}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Severity Rank</span>
                <div>
                  <Badge variant={getSeverityVariant(selectedLog.severity)}>{selectedLog.severity}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Node Email</span>
                <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedLog.user_email || 'GUEST / SYSTEM'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Target Client IP</span>
                <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{selectedLog.ip_address}</span>
              </div>
            </div>

            {/* Details JSON Viewer */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal size={14} className="text-blue-500" />
                <span>Transaction Metadata Payload (JSON)</span>
              </h4>
              <pre className="w-full bg-slate-950 dark:bg-black/40 border border-slate-250/50 dark:border-white/5 p-4 rounded-xl text-[11px] font-mono text-blue-500 dark:text-cyan-400 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap text-left">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            {/* User Agent description */}
            <div className="flex flex-col gap-1 border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/[0.01] p-3.5 rounded-xl text-left">
              <span className="text-[9px] uppercase font-bold text-slate-450 dark:text-slate-500">Captured User-Agent Network Tag</span>
              <span className="text-[10px] text-slate-650 dark:text-slate-400 font-mono leading-normal break-all">
                {selectedLog.user_agent || 'system-direct'}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default AuditLogs;
