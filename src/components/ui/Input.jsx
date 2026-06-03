import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Input = ({
  label,
  error,
  icon: Icon,
  className,
  type = 'text',
  ...props
}) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 text-slate-400 dark:text-slate-500">
            <Icon size={17} />
          </div>
        )}
        <input
          type={type}
          className={twMerge(
            'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors duration-150 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-200/60 dark:border-slate-700 dark:bg-[#12151b] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-700/35',
            Icon && 'pl-10',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/40 dark:focus:border-red-400 dark:focus:ring-red-500/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
};

export default Input;
