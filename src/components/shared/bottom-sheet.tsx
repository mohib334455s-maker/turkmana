'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-[28px] bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-12px_40px_rgba(15,23,42,0.18)]',
          className
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
