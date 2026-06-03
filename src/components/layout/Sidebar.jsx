import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, pendingShareCount } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'editor',
    department: ''
  });
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState('');

  const primaryItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Sharing', path: '/sharing', icon: Share2, count: pendingShareCount },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, requireAdmin: true },
    { name: 'Admin', path: '/admin', icon: ShieldCheck, requireAdmin: true }
  ];

  const resetMemberForm = () => {
    setMemberForm({
      full_name: '',
      email: '',
      password: '',
      role: 'editor',
      department: ''
    });
    setMemberError('');
    setMemberSuccess('');
  };

  const handleAddMemberOpen = () => {
    resetMemberForm();
    setIsAddMemberOpen(true);
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setMemberError('Only administrators can add team members.');
      return;
    }

    setMemberLoading(true);
    setMemberError('');
    setMemberSuccess('');

    try {
      await api.post('/admin/users', memberForm);
      setMemberSuccess('Team member added successfully.');
      setMemberForm({
        full_name: '',
        email: '',
        password: '',
        role: 'editor',
        department: ''
      });
    } catch (err) {
      setMemberError(err.response?.data?.error || 'Failed to add team member.');
    } finally {
      setMemberLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 transform flex-col border-r border-slate-200 bg-white px-3 py-4 transition-transform duration-200 dark:border-[#2a2f3a] dark:bg-[#12151b] md:relative md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
              DS
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950 dark:text-white">DocuShield</p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Secure workspace</p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-[#171a21]">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
          <p className="mt-1 truncate text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.email}</p>
          <div className="mt-2">
            <Badge variant={user?.role === 'admin' ? 'admin' : user?.role === 'editor' ? 'editor' : 'viewer'}>
              {user?.role || 'user'}
            </Badge>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <p className="px-3 pb-1 text-[11px] font-semibold uppercase text-slate-400 dark:text-slate-500">General</p>
          {primaryItems.map((item) => {
            if (item.requireAdmin && !isAdmin) return null;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {item.name}
                </span>
                {item.count > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-col gap-1 border-t border-slate-200 pt-4 dark:border-[#2a2f3a]">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
          >
            <Settings size={16} />
            Settings
          </NavLink>
          <button
            type="button"
            onClick={handleAddMemberOpen}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <UserPlus size={16} />
            Add team member
          </button>
          <NavLink
            to="/support"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`
            }
          >
            <LifeBuoy size={16} />
            Support
          </NavLink>
        </div>
      </aside>

      <Modal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add team member"
        size="lg"
      >
        {!isAdmin ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
            Your current role is <strong>{user?.role}</strong>. Only administrators can create team member accounts.
          </div>
        ) : (
          <form onSubmit={handleAddMemberSubmit} className="flex flex-col gap-4">
            {memberError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                {memberError}
              </div>
            )}
            {memberSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                {memberSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={memberForm.full_name}
                onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                placeholder="Alex Carter"
                required
              />
              <Input
                label="Email"
                type="email"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                placeholder="alex@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Temporary password"
                type="password"
                value={memberForm.password}
                onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                placeholder="Min 8 characters"
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-colors focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/60 dark:border-slate-700 dark:bg-[#12151b] dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700/35"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <Input
              label="Department"
              value={memberForm.department}
              onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
              placeholder="Security, Legal, Engineering..."
            />

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-[#2a2f3a]">
              <Button type="button" variant="secondary" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={memberLoading}>
                Add member
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
};

export default Sidebar;
