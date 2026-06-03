import React from 'react';

export const Table = ({ columns = [], rows = [], renderRow, emptyState = 'No records found.' }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-[#2a2f3a] dark:bg-[#171a21]">
    <div className="overflow-x-auto">
      <table className="w-full min-w-full text-left">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-[#2a2f3a] dark:bg-[#12151b] dark:text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column.key || column} className="px-4 py-3">
                {column.label || column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {rows.length > 0 ? rows.map(renderRow) : (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500 dark:text-slate-400" colSpan={columns.length || 1}>
                {emptyState}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default Table;
