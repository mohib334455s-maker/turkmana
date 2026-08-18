'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import {
  summarizeExchangeBalances,
  type ExchangeHouse,
} from '@/lib/demo-data';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';

const EMPTY: OpsRow[] = [];

export function ExchangeAccountsCard() {
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const items = useOpsStore(
    (s) => (s.lists.exchangeHouses ?? EMPTY) as unknown as ExchangeHouse[]
  );

  const rows = items.filter((e) => matchesCompany(e.company, company));
  const summary = summarizeExchangeBalances(rows);
  const list = summary.exchangers.slice(0, 6);

  return (
    <Card className="rounded-2xl border-slate-200 shadow-none">
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-bold text-slate-900">
            {tx('صرافی‌ها', 'Exchanges')}
          </h3>
          <Link
            href="/dashboard/exchange"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-teal-700"
            title={tx('مدیریت صرافی‌ها', 'Manage exchanges')}
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>

        {list.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-500">
            <p>{tx('هنوز صرافی ثبت نشده است.', 'No exchanges yet.')}</p>
            <Link
              href="/dashboard/exchange?new=1"
              className="mt-2 inline-block text-sm font-semibold text-teal-700 hover:underline"
            >
              {tx('افزودن صرافی', 'Add exchange')}
            </Link>
          </div>
        ) : (
          <div className="px-5 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((house) => {
                const bal = Number(house.balance) || 0;
                const claim = bal > 0 ? bal : 0;
                const due = bal < 0 ? Math.abs(bal) : 0;
                return (
                  <div
                    key={house.id}
                    className="group rounded-xl border border-slate-100 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/dashboard/exchange/${house.id}`}
                          className="block truncate text-sm font-bold text-slate-900 hover:text-teal-700"
                        >
                          {house.name.startsWith('صرافی') ? house.name : `صرافی ${house.name}`}
                        </Link>

                        <div className="mt-2 space-y-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-[12px] text-slate-500">
                              {tx('طلب بالای صرافی', 'Claim')}
                            </span>
                            <span
                              className={cn(
                                'text-[12px] num font-semibold',
                                claim ? 'text-emerald-700' : 'text-slate-400'
                              )}
                            >
                              {formatCurrency(claim)}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-[12px] text-slate-500">
                              {tx('باقیات از صرافی', 'Due')}
                            </span>
                            <span
                              className={cn(
                                'text-[12px] num font-semibold',
                                due ? 'text-rose-600' : 'text-slate-400'
                              )}
                            >
                              {formatCurrency(due)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-end">
                        <Link
                          href={`/dashboard/exchange/${house.id}`}
                          className="text-sm font-semibold text-sky-600 hover:underline"
                        >
                          {tx('مشاهده', 'View')}
                        </Link>
                        <p className={cn('mt-1 text-[11px] num font-medium', balanceClass(bal))}>
                          {formatCurrency(bal)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100">
          <div className="bg-emerald-50/80 px-4 py-3">
            <p className="text-[11px] font-medium text-emerald-800">
              {tx('جمله طلب', 'Total claims')}
            </p>
            <p className="mt-1 text-sm font-extrabold num text-emerald-700">
              {formatCurrency(summary.claimsOnExchangers)}
            </p>
          </div>
          <div className="bg-rose-50/80 px-4 py-3">
            <p className="text-[11px] font-medium text-rose-800">
              {tx('جمله باقیات', 'Total dues')}
            </p>
            <p className="mt-1 text-sm font-extrabold num text-rose-700">
              {formatCurrency(summary.dueFromExchangers)}
            </p>
          </div>
        </div>

        {summary.exchangers.length > 6 ? (
          <div className="border-t border-slate-100 px-5 py-3 text-center">
            <Link href="/dashboard/exchange" className="text-sm font-semibold text-teal-700 hover:underline">
              {tx(
                `همه ${summary.exchangers.length} صرافی`,
                `See all ${summary.exchangers.length} exchanges`
              )}
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
