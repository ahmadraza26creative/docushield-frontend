import React from 'react';
import { Card } from './Card';

export const DashboardCard = ({ title, description, action, children, className = '' }) => (
  <Card className={`p-0 ${className}`}>
    {(title || description || action) && (
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-[#2a2f3a]">
        <div>
          {title && <h2 className="text-sm font-semibold text-slate-950 dark:text-white">{title}</h2>}
          {description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </Card>
);

export default DashboardCard;
