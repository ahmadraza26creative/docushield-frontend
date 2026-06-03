import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className={twMerge('relative z-10 w-full animate-slide-up', sizeClasses[size])}>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#2a2f3a] dark:bg-[#171a21]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-[#2a2f3a]">
            <h3 className="text-base font-semibold text-slate-950 dark:text-slate-50">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
