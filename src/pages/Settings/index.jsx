import React, { useEffect, useState } from 'react';
import { CheckCircle2, Cpu, QrCode, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export const Settings = () => {
  const { user, checkAuth } = useAuth();
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);
  const [showQr, setShowQr] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSuccess, setMfaSuccess] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [manualEntryKey, setManualEntryKey] = useState('');

  useEffect(() => {
    setMfaEnabled(!!user?.mfa_enabled);
  }, [user?.mfa_enabled]);

  const startMfaSetup = async () => {
    setMfaLoading(true);
    setMfaError('');
    setMfaSuccess(false);
    setMfaCode('');
    try {
      const res = await api.post('/auth/mfa/setup');
      setQrCodeDataUrl(res.data.qrCodeDataUrl);
      setManualEntryKey(res.data.manualEntryKey);
      setShowQr(true);
    } catch (err) {
      setMfaError(err.response?.data?.error || 'Failed to initialize MFA setup.');
    } finally {
      setMfaLoading(false);
    }
  };

  const handleMfaVerify = async (e) => {
    e.preventDefault();
    setMfaError('');
    setMfaSuccess(false);
    if (mfaCode.length !== 6) {
      setMfaError('Enter the 6-digit code from Google Authenticator.');
      return;
    }

    setMfaLoading(true);
    try {
      await api.post('/auth/mfa/verify', { token: mfaCode });
      setMfaSuccess(true);
      setMfaEnabled(true);
      setShowQr(false);
      setMfaCode('');
      if (checkAuth) await checkAuth();
    } catch (err) {
      setMfaError(err.response?.data?.error || 'Invalid MFA code.');
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Settings</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Workspace preferences</h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <User size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Account profile</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Identity and current authorization level.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#12151b]">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</p>
                <p className="mt-2 truncate text-sm font-semibold text-slate-950 dark:text-white">{user?.email}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#12151b]">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Access role</p>
                <div className="mt-2">
                  <Badge variant={user?.role === 'admin' ? 'admin' : user?.role === 'editor' ? 'editor' : 'viewer'}>
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Two-factor authentication</h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Use Google Authenticator or Microsoft Authenticator to protect vault access with a timed code.
                  </p>
                </div>
              </div>
              {mfaEnabled ? (
                <Badge variant="success" className="mt-1">
                  Active
                </Badge>
              ) : (
                <Button onClick={startMfaSetup} loading={mfaLoading}>
                  Initialize MFA
                </Button>
              )}
            </div>

            {mfaError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                {mfaError}
              </div>
            )}

            {mfaSuccess && (
              <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                <CheckCircle2 size={16} />
                MFA has been activated successfully.
              </div>
            )}

            {showQr && (
              <div className="mt-5 grid grid-cols-1 gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#12151b] md:grid-cols-[180px_1fr]">
                <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="Google Authenticator MFA QR code" className="h-full w-full object-contain" />
                  ) : (
                    <QrCode size={120} className="text-slate-900" />
                  )}
                </div>
                <form onSubmit={handleMfaVerify} className="flex flex-col justify-center gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Scan setup code</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Scan the QR, then enter the current 6-digit code before it refreshes.
                    </p>
                    {manualEntryKey && (
                      <p className="mt-2 break-all font-mono text-xs text-slate-600 dark:text-slate-300">
                        Manual key: {manualEntryKey}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      placeholder="6-digit code"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      className="text-center font-mono text-lg tracking-widest"
                    />
                    <Button type="submit" variant="secondary" loading={mfaLoading} className="shrink-0">
                      Verify
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Security profile</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Current cryptographic configuration</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              ['Cipher engine', 'AES-256-GCM'],
              ['Envelope guard', 'SHA-256 derived master key'],
              ['Storage', 'uploads/encrypted/*.enc'],
              ['Session policy', '15 minute inactivity timeout']
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#12151b]">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
