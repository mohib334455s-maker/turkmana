'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';

export function ExpensePageBar({
  title,
  balance,
  backHref = '/dashboard/finance/expenses',
  backLabel = 'فهرست عمومی',
  actions,
}: {
  title: string;
  balance: number;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-3 bg-[#1e3a5f] px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
        <Link href={backHref}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-white/15 text-white hover:bg-white/25"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            {backLabel}
          </Button>
        </Link>
        <h1 className="text-center text-base font-bold sm:text-lg">{title}</h1>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
          <div className="rounded-lg bg-white/10 px-3 py-1.5 text-sm">
            <span className="ml-2 opacity-80">بیلانس</span>
            <span className={cn('num font-extrabold', balance < 0 ? 'text-rose-200' : 'text-emerald-200')}>
              {formatCurrency(balance)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExpenseBalanceLink({
  href,
  amount,
  empty = false,
}: {
  href: string;
  amount: number;
  empty?: boolean;
}) {
  if (empty || amount === 0) {
    return (
      <Link href={href} className="num text-[var(--brand)] hover:underline">
        -
      </Link>
    );
  }
  return (
    <Link href={href} className={cn('num font-semibold hover:underline', balanceClass(amount))}>
      {formatCurrency(amount)}
    </Link>
  );
}
