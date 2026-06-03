import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Clock,
  FileText,
  Lock,
  Plus,
  ScrollText,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const formatSize = (bytes) => {
  if (!bytes) return '0 B';
  const numericBytes = Number(bytes);
  if (!numericBytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(numericBytes) / Math.log(k));
  return `${parseFloat((numericBytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const StatCard = ({ label, value, helper, icon: Icon }) => (
  <Card hoverEffect className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#12151b] dark:text-slate-200">
        <Icon size={17} />
      </div>
    </div>
    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{helper}</p>
  </Card>
);

const ActionCard = ({ title, description, icon: Icon, to, cta }) => (
  <Link to={to}>
    <Card hoverEffect className="flex h-full flex-col justify-between gap-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
          <Icon size={18} />
        </div>
        <ArrowUpRight size={16} className="text-slate-400" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <span className="text-sm font-semibold text-slate-950 dark:text-slate-100">{cta}</span>
    </Card>
  </Link>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    files: 0,
    shares: 0,
    activities: 0,
    storage: '0 B'
  });
  const [recentFiles, setRecentFiles] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const docsRes = await api.get('/documents');
        const documents = docsRes.data.documents || [];
        setRecentFiles(documents.slice(0, 5));

        const totalBytes = documents.reduce((acc, doc) => acc + parseInt(doc.file_size || 0, 10), 0);
        const storageString = formatSize(totalBytes);

        let sharesCount = 0;
        try {
          const sharesRes = await api.get('/sharing');
          sharesCount = (sharesRes.data.shares || []).length;
        } catch {
          sharesCount = documents.filter((d) => d.effective_permission !== 'owner').length;
        }

        if (user?.role === 'admin') {
          try {
            const metricsRes = await api.get('/admin/metrics');
            const metrics = metricsRes.data.metrics;
            setStats({
              files: metrics.totalDocuments,
              shares: metrics.totalShares,
              activities: metrics.totalAuditLogs,
              storage: storageString
            });
            setSystemAlerts(metricsRes.data.recentAlerts || []);
          } catch (e) {
            console.error('Failed to load admin telemetry', e.message);
          }
        } else {
          setStats({
            files: documents.length,
            shares: sharesCount,
            activities: documents.length * 2 + sharesCount,
            storage: storageString
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const activityItems = [
    { title: 'Session verified', detail: user?.email || 'Active user', time: 'Now', icon: ShieldCheck },
    { title: 'Documents synced', detail: `${stats.files} accessible documents`, time: 'Recent', icon: FileText },
    { title: 'Sharing policy active', detail: `${stats.shares} grants tracked`, time: 'Live', icon: Share2 }
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Dashboard</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="hidden sm:inline-flex">
            <Clock size={15} />
            Today
          </Button>
          <Link to="/documents">
            <Button>
              <Plus size={15} />
              New document
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Card className="flex min-h-80 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950 dark:border-slate-800 dark:border-t-white" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading workspace</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Documents" value={stats.files} helper="Accessible in your vault" icon={FileText} />
              <StatCard label="Shared Links" value={stats.shares} helper="Active collaboration grants" icon={Share2} />
              <StatCard label="Active Sessions" value={user?.role === 'admin' ? stats.activities : 1} helper="Verified access events" icon={Activity} />
              <StatCard label="Security Alerts" value={systemAlerts.length} helper="Open critical alerts" icon={ShieldAlert} />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ActionCard
                title="Upload Secure Document"
                description="Add a file to the encrypted vault with access controls and audit history."
                icon={Upload}
                to="/documents"
                cta="Open vault"
              />
              <ActionCard
                title="Generate Secure Share"
                description="Create direct access invitations or protected share links for collaborators."
                icon={Share2}
                to="/sharing"
                cta="Manage sharing"
              />
              <ActionCard
                title="View Audit Logs"
                description="Review access attempts, downloads, previews, and security policy events."
                icon={ScrollText}
                to={user?.role === 'admin' ? '/audit-logs' : '/settings'}
                cta={user?.role === 'admin' ? 'Open logs' : 'View settings'}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="p-0">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#2a2f3a]">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Recent documents</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest accessible vault files</p>
                  </div>
                  <Link to="/documents" className="text-sm font-semibold text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                    View all
                  </Link>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentFiles.length > 0 ? recentFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/35">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{file.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{formatSize(file.file_size)}</p>
                        </div>
                      </div>
                      <Badge variant={file.effective_permission === 'owner' ? 'success' : file.effective_permission === 'editor' ? 'editor' : 'viewer'}>
                        {file.effective_permission}
                      </Badge>
                    </div>
                  )) : (
                    <div className="px-5 py-12 text-center">
                      <FileText className="mx-auto text-slate-300 dark:text-slate-700" size={34} />
                      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No documents yet</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload a secure document to get started.</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-0">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-[#2a2f3a]">
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Security alerts</h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Policy events and risk signals</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {user?.role !== 'admin' ? (
                    <div className="px-5 py-12 text-center">
                      <Lock className="mx-auto text-slate-300 dark:text-slate-700" size={34} />
                      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">Admin visibility required</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Audit streams are restricted by least privilege.</p>
                    </div>
                  ) : systemAlerts.length > 0 ? systemAlerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/35">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{alert.action}</p>
                        <Badge variant={alert.severity === 'critical' ? 'danger' : 'warning'}>{alert.severity}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{alert.ip_address || 'Unknown IP'}</p>
                    </div>
                  )) : (
                    <div className="px-5 py-12 text-center">
                      <ShieldCheck className="mx-auto text-emerald-400" size={34} />
                      <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">No critical alerts</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Security posture is currently stable.</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <Card className="p-0">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-[#2a2f3a]">
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Activity</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Workspace collaboration stream</p>
              </div>
              <div className="space-y-1 p-3">
                {activityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800/35">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <Icon size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-950 dark:text-white">{item.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">System posture</h2>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Sessions, sharing grants, and document access are continuously checked against current account state.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
