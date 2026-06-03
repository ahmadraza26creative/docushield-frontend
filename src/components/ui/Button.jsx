import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-slate-500/40 dark:focus:ring-offset-[#0f1115] disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-slate-950 text-white border border-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:border-white dark:hover:bg-slate-200',
    secondary: 'bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-100 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-800',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/25 dark:hover:bg-red-500/15',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25 dark:hover:bg-emerald-500/15',
    cyber: 'bg-slate-950 text-white border border-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:border-white dark:hover:bg-slate-200',
    ghost: 'bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm'
  };

  return (
    <button
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
