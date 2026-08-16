'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileRecordCard({
  title,
  subtitle,
  badge,
  icon,
  metrics,
  preview,
  extra,
  footer,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  metrics?: Array<{ label: string; value: React.ReactNode }>;
  preview?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={cn(
        'rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.045)]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
          <div className="min-w-0">
            <h3 className="break-words text-[15px] font-bold leading-snug text-slate-900">{title}</h3>
            {subtitle ? <p className="mt-0.5 break-words text-xs text-slate-500">{subtitle}</p> : null}
          </div>
        </div>
        {badge}
      </div>

      {metrics && metrics.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-xl bg-slate-50 px-2.5 py-2">
              <p className="text-[10px] font-medium text-slate-400">{m.label}</p>
              <div className="mt-0.5 text-sm font-semibold text-slate-800 break-words">{m.value}</div>
            </div>
          ))}
        </div>
      ) : null}

      {preview}

      {extra ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-teal-700"
          >
            {open ? 'کمتر' : 'جزئیات بیشتر'}
            <ChevronDown className={cn('h-3.5 w-3.5 transition', open && 'rotate-180')} />
          </button>
          {open ? <div className="mt-2 space-y-1.5 text-xs text-slate-600">{extra}</div> : null}
        </>
      ) : null}

      {footer ? <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">{footer}</div> : null}
    </article>
  );
}

export function ResponsiveData({
  table,
  cards,
  breakpoint = 'lg',
}: {
  table: React.ReactNode;
  cards: React.ReactNode;
  /** md = cards below 768px; lg = cards below 1024px (tablet + mobile) */
  breakpoint?: 'md' | 'lg';
}) {
  const tableClass = breakpoint === 'md' ? 'hidden md:block' : 'hidden lg:block';
  const cardsClass =
    breakpoint === 'md' ? 'space-y-3 px-4 md:hidden' : 'space-y-3 px-4 lg:hidden';

  return (
    <>
      <div className={tableClass}>{table}</div>
      <div className={cardsClass}>{cards}</div>
    </>
  );
}

export function ExtraRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-2.5 py-1.5">
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className="text-left font-medium text-slate-800">{value}</span>
    </div>
  );
}
