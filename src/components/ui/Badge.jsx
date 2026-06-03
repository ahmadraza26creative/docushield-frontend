import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = 'info', className, ...props }) => {
  const baseStyles = 'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize';

  const variants = {
    info: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300',
    warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300',
    danger: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300',
    admin: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/25 dark:bg-violet-500/10 dark:text-violet-300',
    editor: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300',
    viewer: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
  };

  return (
    <span className={twMerge(baseStyles, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};

export default Badge;
