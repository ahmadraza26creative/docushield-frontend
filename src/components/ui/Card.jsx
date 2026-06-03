import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, hoverEffect = false, ...props }) => {
  return (
    <div
      className={twMerge(
        'relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-[#2a2f3a] dark:bg-[#171a21]',
        hoverEffect && 'transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] dark:hover:border-slate-600 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.28)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
