import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError('Please enter your email and password.');
      return;
    }

    if (mfaRequired && mfaCode.length !== 6) {
      setFormError('Enter the 6-digit authenticator code.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      await login(email, password, mfaCode);
      navigate('/');
    } catch (err) {
      if (err.mfaRequired) setMfaRequired(true);
      setFormError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f8] p-4 dark:bg-[#0f1115]">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            DS
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">DocuShield</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your secure workspace</p>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Welcome back</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Enter your credentials to continue.
          </p>

          {formError && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
              <Shield size={16} className="mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute bottom-3 right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mfaRequired && (
              <Input
                label="Authenticator code"
                type="text"
                placeholder="6-digit code"
                icon={Shield}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className="text-center font-mono text-lg tracking-widest"
              />
            )}

            <Button type="submit" className="mt-2 w-full py-2.5" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-5 text-center dark:border-[#2a2f3a]">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              New to DocuShield?{' '}
              <Link to="/register" className="font-semibold text-slate-950 hover:underline dark:text-white">
                Create account
              </Link>
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
