'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

export type FlowStep = {
  href: string;
  labelFa: string;
  labelEn: string;
  active?: boolean;
};

/** Horizontal linked steps so users see قرارداد → پارتی → خرید → فاکتور → انبار together. */
export function FlowLinks({ steps, className }: { steps: FlowStep[]; className?: string }) {
  const { locale } = useI18n();
  return (
    <nav
      className={cn(
        'flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs',
        className
      )}
      aria-label="purchase flow"
    >
      {steps.map((s, i) => (
        <span key={s.href + s.labelFa} className="inline-flex items-center gap-1">
          {i > 0 ? <ChevronLeft className="h-3.5 w-3.5 text-slate-300" /> : null}
          <Link
            href={s.href}
            className={cn(
              'rounded-lg px-2.5 py-1 font-medium transition',
              s.active
                ? 'bg-teal-600 text-white'
                : 'text-slate-600 hover:bg-white hover:text-teal-700'
            )}
          >
            {locale === 'en' ? s.labelEn : s.labelFa}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export const PURCHASE_FLOW_STEPS: FlowStep[] = [
  { href: '/dashboard/contracts', labelFa: 'قرارداد', labelEn: 'Contract' },
  { href: '/dashboard/parties', labelFa: 'پارتی', labelEn: 'Party' },
  { href: '/dashboard/purchases', labelFa: 'سفارش خرید', labelEn: 'Purchase order' },
  { href: '/dashboard/purchases/company', labelFa: 'خریداری', labelEn: 'Company purchase' },
  { href: '/dashboard/purchases/invoices', labelFa: 'فاکتور', labelEn: 'Invoice' },
  { href: '/dashboard/warehouses', labelFa: 'انبار', labelEn: 'Warehouse' },
];
