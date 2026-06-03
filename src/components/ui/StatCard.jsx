import React from 'react';
import { Card } from './Card';

export const StatCard = ({ label, value, helper, icon: Icon }) => (
  <Card hoverEffect className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      </div>
      {Icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-[#12151b] dark:text-slate-200">
          <Icon size={17} />
        </div>
      )}
    </div>
    {helper && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
  </Card>
);

export default StatCard;
