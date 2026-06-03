import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Settings, 
  ShieldAlert, 
  Activity, 
  TrendingUp, 
  Clock,
  UserX,
  UserCheck,
  Plus,
  Trash2,
  FileText,
  Mail,
  Lock,
  Building,
  Shield,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';

export const Admin = () => {
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    totalStorage: 0,
    totalShares: 0,
    totalAuditLogs: 0,
    criticalAlertsCount: 0
  });

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Segmented view state: 'users', 'documents', or 'ai'
  const [adminTab, setAdminTab] = useState('users');

  // AI Security report state
  const [aiReport, setAiReport] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Create User modal state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'viewer',
    department: ''
  });
  const [createUserError, setCreateUserError] = useState('');

  // Fetch admin panel data
  const fetchAdminConsoleData = async () => {
    try {
      setLoading(true);
      
      const userRes = await api.get('/admin/users');
      setUsers(userRes.data.users || []);

      const docsRes = await api.get('/admin/documents');
      setDocuments(docsRes.data.documents || []);

      const metricsRes = await api.get('/admin/metrics');
      setMetrics(metricsRes.data.metrics);
      setRecentLogs(metricsRes.data.recentAlerts || []);
    } catch (err) {
      console.error('Failed to load admin console data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiReport = async () => {
    try {
      setLoadingAi(true);
      const res = await api.get('/admin/ai-analysis');
      setAiReport(res.data);
    } catch (err) {
      console.error('Failed to load AI report:', err.message);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAdminConsoleData();
  }, []);

  useEffect(() => {
    if (adminTab === 'ai') {
      fetchAiReport();
    }
  }, [adminTab]);

  // Update User Role on the fly
  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoadingId(userId);
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminConsoleData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle User suspension status
  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    
    if (newStatus === 'suspended' && !window.confirm('WARNING: Suspending this node will immediately block their API access and deny login requests. Proceed?')) {
      return;
    }

    try {
      setActionLoadingId(userId);
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      fetchAdminConsoleData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Physically delete a user
  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`WARNING: Deleting user ${userEmail} will permanently purge their credentials and metadata from the vault. Proceed?`)) {
      return;
    }

    try {
      setActionLoadingId(userId);
      await api.delete(`/admin/users/${userId}`);
      fetchAdminConsoleData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user account.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Physically revoke/purge document globally
  const handleRevokeDocument = async (docId, docTitle) => {
    if (!window.confirm(`WARNING: Revoking document "${docTitle}" will physically purge the encrypted archive and delete all public tokens and direct sharing access globally. Proceed?`)) {
      return;
    }

    try {
      setActionLoadingId(docId);
      await api.delete(`/admin/documents/${docId}`);
      fetchAdminConsoleData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to revoke document access.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit User creation
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreateUserError('');
    
    try {
      await api.post('/admin/users', createUserForm);
      setIsCreateUserOpen(false);
      setCreateUserForm({
        email: '',
        password: '',
        full_name: '',
        role: 'viewer',
        department: ''
      });
      fetchAdminConsoleData();
    } catch (err) {
      setCreateUserError(err.response?.data?.error || 'Failed to enroll new user.');
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-8 transition-colors duration-300">
      {/* Visual background glows */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 dark:bg-blue-500/[0.01] rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col gap-1.5 sm:flex-row justify-between sm:items-end z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white uppercase leading-none">
            Admin <span className="text-blue-500 font-extrabold">Terminal</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            System telemetry administration console. Adjust user roles and manage general platform authorization parameters.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-[10px] font-bold text-slate-450 tracking-widest uppercase">Initializing Telemetry Console...</span>
        </div>
      ) : (
        <>
          {/* Detailed System Health Dials */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 z-10">
            <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                <Users size={12} className="text-blue-500" />
                <span>Nodes Enrolled</span>
              </h4>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {metrics.totalUsers}
                </span>
                <span className="text-[9px] text-blue-500 dark:text-cyan-400 font-bold uppercase">
                  Active accounts
                </span>
              </div>
            </Card>

            <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                <FileText size={12} className="text-indigo-500" />
                <span>Vault Envelopes</span>
              </h4>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">
                  {metrics.totalDocuments}
                </span>
                <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-bold uppercase">
                  secured files
                </span>
              </div>
            </Card>

            <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                <HardDrive size={12} className="text-emerald-500" />
                <span>Total Storage Capacity</span>
              </h4>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-slate-800 dark:text-white leading-none truncate pr-2">
                  {formatSize(metrics.totalStorage)}
                </span>
                <span className="text-[9px] text-emerald-500 font-bold uppercase shrink-0">
                  AES-256-GCM
                </span>
              </div>
            </Card>

            <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-red-500" />
                <span>Zero-Trust Alerts</span>
              </h4>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-black text-red-500 dark:text-red-400 leading-none">
                  {metrics.criticalAlertsCount}
                </span>
                <Badge variant={metrics.criticalAlertsCount > 5 ? 'danger' : 'warning'}>
                  {metrics.criticalAlertsCount > 5 ? 'Critical Risks' : 'Moderate'}
                </Badge>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 items-start">
            
            {/* Left/Middle: Directory Arena */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-5 flex flex-col gap-5">
                {/* Tabs & Create controls */}
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-0.5">
                  <div className="flex gap-6">
                    <button
                      onClick={() => setAdminTab('users')}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                        adminTab === 'users' 
                          ? 'text-blue-500' 
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      Users ({users.length})
                      {adminTab === 'users' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full glow-primary"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setAdminTab('documents')}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                        adminTab === 'documents' 
                          ? 'text-blue-500' 
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      Documents ({documents.length})
                      {adminTab === 'documents' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full glow-primary"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setAdminTab('ai')}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                        adminTab === 'ai' 
                          ? 'text-blue-500' 
                          : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      AI Monitor
                      {adminTab === 'ai' && (
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full glow-primary"></div>
                      )}
                    </button>
                  </div>

                  {adminTab === 'users' && (
                    <Button 
                      onClick={() => setIsCreateUserOpen(true)}
                      variant="primary"
                      size="sm"
                      className="flex items-center gap-1 font-bold text-xs shrink-0 py-1.5"
                    >
                      <Plus size={13} />
                      <span>Enroll User</span>
                    </Button>
                  )}
                </div>

                {/* Display 1: User list */}
                {adminTab === 'users' && (
                  <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-xl">
                    <table className="w-full text-left border-collapse bg-slate-200/10 dark:bg-[#000000]/10">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5 text-[9px] text-slate-450 dark:text-slate-450 uppercase font-bold tracking-widest">
                          <th className="py-3 px-4">Identity Email</th>
                          <th className="py-3 px-4">Access Role</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-350">
                        {users.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-200/20 dark:hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                              <div className="flex flex-col">
                                <span>{item.email}</span>
                                <span className="text-[8px] font-sans font-semibold text-slate-450 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                                  Enrolled: {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={item.role}
                                onChange={(e) => handleRoleChange(item.id, e.target.value)}
                                disabled={actionLoadingId === item.id}
                                className="bg-slate-100 border border-slate-250 dark:bg-slate-950 dark:border-slate-850 dark:text-white rounded px-2 py-1 text-[10px] font-bold focus:outline-none focus:border-blue-500"
                              >
                                <option value="viewer">Viewer (Read Only)</option>
                                <option value="editor">Editor (Upload)</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={item.status === 'active' ? 'success' : 'danger'}>
                                {item.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleToggleStatus(item.id, item.status)}
                                  disabled={actionLoadingId === item.id}
                                  className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-transparent text-[10px] font-bold uppercase transition-all ${
                                    item.status === 'active' 
                                      ? 'text-red-500 hover:bg-red-500/10' 
                                      : 'text-emerald-500 hover:bg-emerald-500/10'
                                  }`}
                                  title={item.status === 'active' ? 'Suspend Node' : 'Activate Node'}
                                >
                                  {item.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(item.id, item.email)}
                                  disabled={actionLoadingId === item.id}
                                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-transparent text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                                  title="Delete Node"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Display 2: Global Documents list */}
                {adminTab === 'documents' && (
                  <div className="overflow-x-auto border border-slate-200 dark:border-white/5 rounded-xl">
                    <table className="w-full text-left border-collapse bg-slate-200/10 dark:bg-[#000000]/10">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-white/5 text-[9px] text-slate-450 dark:text-slate-450 uppercase font-bold tracking-widest">
                          <th className="py-3 px-4">Title / Owner</th>
                          <th className="py-3 px-4">Size</th>
                          <th className="py-3 px-4">SHA-256 Hash</th>
                          <th className="py-3 px-4 text-right">Revoke</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-xs text-slate-700 dark:text-slate-350">
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-200/20 dark:hover:bg-white/[0.01] transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                              <div className="flex flex-col min-w-0">
                                <span className="truncate max-w-[160px]">{doc.title}</span>
                                <span className="text-[8px] font-sans font-semibold text-blue-500 dark:text-cyan-400 mt-0.5 lowercase tracking-wider truncate">
                                  owner: {doc.owner_email || 'System'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-[10px]">
                              {formatSize(doc.file_size)}
                            </td>
                            <td className="py-3 px-4 font-mono text-[9px] max-w-[80px] truncate text-slate-450 dark:text-slate-500" title={doc.file_hash}>
                              {doc.file_hash || 'none'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleRevokeDocument(doc.id, doc.title)}
                                disabled={actionLoadingId === doc.id}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-transparent text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                                title="Revoke access & Delete permanently"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Display 3: AI Threat Security Analysis Tab */}
                {adminTab === 'ai' && (
                  <div className="flex flex-col gap-6">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-0.5 text-left">
                        <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 leading-none">
                          <ShieldCheck size={14} className="text-blue-500" />
                          <span>Zero-Trust AI Cybersecurity Quarantines</span>
                        </h4>
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold leading-normal">
                          Continuous machine intelligence log scans analyzing threat indicators.
                        </span>
                      </div>

                      <Button
                        onClick={fetchAiReport}
                        disabled={loadingAi}
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 font-bold text-xs shrink-0 py-1.5"
                      >
                        <RefreshCw size={12} className={loadingAi ? 'animate-spin' : ''} />
                        <span>Re-Audit Logs</span>
                      </Button>
                    </div>

                    {loadingAi ? (
                      <div className="py-16 flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Running AI Agent Audits...</span>
                      </div>
                    ) : !aiReport ? (
                      <div className="py-12 text-center border border-dashed border-slate-200 dark:border-white/5 rounded-xl">
                        <ShieldAlert className="text-slate-450 dark:text-white/5 mb-2.5 mx-auto shrink-0" size={32} />
                        <h5 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">No AI Data Available</h5>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6 animate-fade-in">
                        
                        {/* Summary Block and Circular Risk meter */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-200/40 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 p-5 rounded-2xl">
                          {/* Circular SVG Gauge for Risk index */}
                          <div className="flex flex-col items-center justify-center relative py-2">
                            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                className="stroke-slate-300 dark:stroke-white/5 fill-none" 
                                strokeWidth="8" 
                              />
                              <circle 
                                cx="50" 
                                cy="50" 
                                r="40" 
                                className={`fill-none transition-all duration-1000 ${
                                  aiReport.riskScore > 75 
                                    ? 'stroke-red-500' 
                                    : aiReport.riskScore > 40 
                                      ? 'stroke-yellow-500' 
                                      : 'stroke-emerald-500'
                                }`} 
                                strokeWidth="8" 
                                strokeDasharray={251.2}
                                strokeDashoffset={251.2 - (251.2 * aiReport.riskScore) / 100}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                              <span className="text-2xl font-black tracking-tight text-slate-850 dark:text-white leading-none">
                                {aiReport.riskScore}%
                              </span>
                              <span className="text-[8px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mt-1">
                                Risk index
                              </span>
                            </div>
                          </div>

                          <div className="md:col-span-2 flex flex-col gap-2.5 text-left">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border self-start ${
                              aiReport.threatLevel === 'critical' 
                                ? 'bg-red-500/10 text-red-500 border-red-500/10' 
                                : aiReport.threatLevel === 'high' 
                                  ? 'bg-red-500/10 text-red-400 border-red-500/10'
                                  : aiReport.threatLevel === 'moderate'
                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10'
                                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                            }`}>
                              Threat Status: {aiReport.threatLevel}
                            </span>
                            <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                              {aiReport.summary}
                            </p>
                          </div>
                        </div>

                        {/* Telemetry Matrix Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                          {/* Card 1: Anomalies */}
                          <div className="border border-slate-200 dark:border-white/5 bg-slate-200/20 dark:bg-white/[0.01] rounded-xl p-4.5 flex flex-col gap-3">
                            <h5 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                              Anomalous Threat Quarantines
                            </h5>
                            {aiReport.anomalies?.length === 0 ? (
                              <span className="text-xs font-semibold text-slate-400">No anomalous triggers.</span>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {aiReport.anomalies?.map((item, idx) => (
                                  <div key={idx} className="bg-slate-250/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-300/40 dark:border-white/5 text-[10px] flex justify-between gap-3">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.type}</span>
                                      <span className="text-slate-450 dark:text-slate-500">{item.description}</span>
                                    </div>
                                    <Badge variant={item.severity === 'critical' ? 'danger' : 'warning'} className="shrink-0 self-start">
                                      {item.severity}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card 2: Suspicious Downloads */}
                          <div className="border border-slate-200 dark:border-white/5 bg-slate-200/20 dark:bg-white/[0.01] rounded-xl p-4.5 flex flex-col gap-3">
                            <h5 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                              Suspicious Download Audits
                            </h5>
                            {aiReport.suspiciousDownloads?.length === 0 ? (
                              <span className="text-xs font-semibold text-slate-400">Zero excessive download rates.</span>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {aiReport.suspiciousDownloads?.map((item, idx) => (
                                  <div key={idx} className="bg-slate-250/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-300/40 dark:border-white/5 text-[10px] flex justify-between gap-3 items-center">
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.user}</span>
                                      <span className="text-slate-450 dark:text-slate-500">{item.count} file decryptions inside {item.timeframe}</span>
                                    </div>
                                    <Badge variant="danger" className="shrink-0">{item.riskLevel}</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card 3: Unusual Logins */}
                          <div className="border border-slate-200 dark:border-white/5 bg-slate-200/20 dark:bg-white/[0.01] rounded-xl p-4.5 flex flex-col gap-3">
                            <h5 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                              Unusual Auth Logins
                            </h5>
                            {aiReport.unusualLogins?.length === 0 ? (
                              <span className="text-xs font-semibold text-slate-400">Zero credential stuffing warnings.</span>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {aiReport.unusualLogins?.map((item, idx) => (
                                  <div key={idx} className="bg-slate-250/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-300/40 dark:border-white/5 text-[10px] flex flex-col gap-1">
                                    <div className="flex justify-between font-bold">
                                      <span className="text-slate-800 dark:text-slate-200">{item.user}</span>
                                      <span className="text-slate-400 font-mono text-[9px]">{item.ip}</span>
                                    </div>
                                    <span className="text-yellow-500 dark:text-yellow-450 font-semibold">{item.reason}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Card 4: Insider Threats */}
                          <div className="border border-slate-200 dark:border-white/5 bg-slate-200/20 dark:bg-white/[0.01] rounded-xl p-4.5 flex flex-col gap-3">
                            <h5 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                              Insider Threat Indicators
                            </h5>
                            {aiReport.insiderThreats?.length === 0 ? (
                              <span className="text-xs font-semibold text-slate-400">Zero malicious actor indices.</span>
                            ) : (
                              <div className="flex flex-col gap-2">
                                {aiReport.insiderThreats?.map((item, idx) => (
                                  <div key={idx} className="bg-slate-250/50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-300/40 dark:border-white/5 text-[10px] flex justify-between gap-3 items-center">
                                    <div className="flex flex-col gap-0.5 min-w-0">
                                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.user}</span>
                                      <span className="text-slate-450 dark:text-slate-500">{item.behavior}</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <Badge variant="danger">{item.threatLevel}</Badge>
                                      <div className="text-[8px] font-bold font-mono mt-1 text-slate-400">{item.confidenceScore}% conf.</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* AI Remediations Block */}
                        <div className="flex flex-col gap-3 bg-indigo-500/5 border border-indigo-500/10 p-5 rounded-xl text-left">
                          <h4 className="text-xs font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                            <Shield size={14} />
                            <span>AI Recommended Security Remediations</span>
                          </h4>
                          <ul className="flex flex-col gap-2 text-xs font-medium text-slate-705 dark:text-slate-300 mt-1 pl-4 list-decimal leading-relaxed">
                            {aiReport.remediations?.map((item, idx) => (
                              <li key={idx} className="marker:text-indigo-500">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Live Activity Feed */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5 pl-1">
                <Activity size={14} className="text-blue-500 animate-pulse" />
                <span>Live Security Alerts</span>
              </h3>

              <Card className="glass-card-dark not-dark:glass-card-light rounded-xl p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
                {recentLogs.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <ShieldCheck className="text-slate-350 dark:text-white/5 mb-3 shrink-0" size={32} />
                    <span className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">
                      Zero Incidents Logged
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium leading-normal">
                      Security gateways report clean telemetry. Zero warning or critical operations recorded.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 text-left">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="flex gap-2.5 items-start relative pb-3 border-b border-slate-200 dark:border-white/5 last:border-b-0 last:pb-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                          log.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400">
                            {new Date(log.created_at).toLocaleTimeString()}
                          </span>
                          <span className="text-xs font-black text-slate-800 dark:text-white leading-tight uppercase tracking-wider mt-0.5 truncate" title={log.action}>
                            {log.action}
                          </span>
                          <span className="text-[9px] font-sans font-bold text-blue-500 dark:text-cyan-400 truncate mt-0.5 font-semibold">
                            User: {log.user_email || 'GUEST'}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            IP: {log.ip_address}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      {/* Enroll User pop-up Modal */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Enroll New Security Node Credentials"
        size="sm"
      >
        <form onSubmit={handleCreateUserSubmit} className="flex flex-col gap-4 text-slate-805 dark:text-white">
          {createUserError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-bold p-3 rounded-lg flex gap-2">
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{createUserError}</span>
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="e.g. Adeeb Adeeb"
            value={createUserForm.full_name}
            onChange={(e) => setCreateUserForm({ ...createUserForm, full_name: e.target.value })}
            required
            icon={Building}
          />

          <Input
            label="Identity Email"
            placeholder="e.g. colleague@docushield.io"
            type="email"
            value={createUserForm.email}
            onChange={(e) => setCreateUserForm({ ...createUserForm, email: e.target.value })}
            required
            icon={Mail}
          />

          <Input
            label="Default Passphrase"
            type="password"
            placeholder="Strong alphanumeric password..."
            value={createUserForm.password}
            onChange={(e) => setCreateUserForm({ ...createUserForm, password: e.target.value })}
            required
            icon={Lock}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest leading-none">
                Access Role
              </label>
              <select
                value={createUserForm.role}
                onChange={(e) => setCreateUserForm({ ...createUserForm, role: e.target.value })}
                className="w-full bg-slate-100 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-white rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 mt-2"
              >
                <option value="viewer">Viewer (Read Only)</option>
                <option value="editor">Editor (Upload)</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            <Input
              label="Department (Optional)"
              placeholder="e.g. Compliance"
              value={createUserForm.department}
              onChange={(e) => setCreateUserForm({ ...createUserForm, department: e.target.value })}
              icon={Shield}
            />
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsCreateUserOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="font-bold">
              Enroll Credentials
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Admin;
