import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Shield, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setFormError('Please complete all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(password)) {
      setFormError('Password must include uppercase, lowercase, number, and special character.');
      return;
    }

    setLoading(true);
    setFormError('');

    try {
      await register(email, password, fullName);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setFormError(err.message || 'Registration failed.');
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
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Create workspace access</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Register a DocuShield account</p>
        </div>

        <Card>
          {success ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle2 size={48} className="text-emerald-500" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">Account created</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Redirecting you to sign in.</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">New account</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                New users are assigned editor access by default.
              </p>

              {formError && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
                  <Shield size={16} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <Input label="Full name" type="text" placeholder="Alex Carter" icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} required />

                <div className="relative">
                  <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" icon={Lock} value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button
                    type="button"
                    className="absolute bottom-3 right-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <Input label="Confirm password" type={showPassword ? 'text' : 'password'} placeholder="Repeat password" icon={Lock} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />

                <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:border-slate-700 dark:bg-[#12151b] dark:text-slate-300">
                  <Shield size={15} className="mt-0.5 shrink-0" />
                  <span>Admin access must be approved and configured by an administrator.</span>
                </div>

                <Button type="submit" className="mt-2 w-full py-2.5" loading={loading}>
                  Create account
                </Button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-5 text-center dark:border-[#2a2f3a]">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-slate-950 hover:underline dark:text-white">
                    Sign in
                  </Link>
                </span>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Register;
