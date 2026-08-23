'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Building2, Landmark, Pencil, Wallet } from 'lucide-react';
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
  const { tx, dir } = useI18n();
  const { company } = useCompanyStore();
  const items = useOpsStore(
    (s) => (s.lists.exchangeHouses ?? EMPTY) as unknown as ExchangeHouse[]
  );

  const rows = items.filter((e) => matchesCompany(e.company, company));
  const summary = summarizeExchangeBalances(rows);
  const list = summary.exchangers.slice(0, 8);
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200/80 shadow-[0_8px_40px_rgba(15,23,42,0.06)]">
      <CardContent className="p-0">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 px-6 py-6 sm:px-8 sm:py-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Landmark className="h-7 w-7 text-white" strokeWidth={1.6} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white sm:text-2xl">
                  {tx('صرافی‌ها', 'Exchanges')}
                </h3>
                <p className="mt-1 text-sm text-sky-100/85">
                  {tx(
                    'طلب بالای صرافی و باقیات — جداگانه',
                    'Claims and dues — tracked separately'
                  )}
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/exchange"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              <Pencil className="h-4 w-4" />
              {tx('مدیریت', 'Manage')}
            </Link>
          </div>

          {/* Summary strip */}
          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-100">
                {tx('جمله طلب', 'Total claims')}
              </p>
              <p className="mt-1 text-lg font-extrabold num text-white sm:text-xl">
                {formatCurrency(summary.claimsOnExchangers)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-rose-100">
                {tx('جمله باقیات', 'Total dues')}
              </p>
              <p className="mt-1 text-lg font-extrabold num text-white sm:text-xl">
                {formatCurrency(summary.dueFromExchangers)}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-sky-100">
                {tx('تعداد صرافی', 'Exchange count')}
              </p>
              <p className="mt-1 text-lg font-extrabold num text-white sm:text-xl">
                {summary.exchangers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        {list.length === 0 ? (
          <div className="px-6 py-14 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
              <Building2 className="h-8 w-8 text-sky-400" />
            </div>
            <p className="mt-4 text-base font-medium text-slate-600">
              {tx('هنوز صرافی ثبت نشده است.', 'No exchanges yet.')}
            </p>
            <Link
              href="/dashboard/exchange?new=1"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
            >
              {tx('افزودن صرافی', 'Add exchange')}
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="px-5 py-6 sm:px-7 sm:py-7">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {list.map((house) => {
                const bal = Number(house.balance) || 0;
                const claim = bal > 0 ? bal : 0;
                const due = bal < 0 ? Math.abs(bal) : 0;
                return (
                  <Link
                    key={house.id}
                    href={`/dashboard/exchange/${house.id}`}
                    className="group block rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 p-5 transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg hover:shadow-sky-100/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
                        <Wallet className="h-5 w-5" strokeWidth={1.75} />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                        {house.currency ?? 'USD'}
                      </span>
                    </div>

                    <h4 className="mt-4 truncate text-base font-extrabold text-slate-900 group-hover:text-sky-800">
                      {house.name.startsWith('صرافی') ? house.name : `صرافی ${house.name}`}
                    </h4>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-emerald-50/80 px-3 py-2.5">
                        <p className="text-[10px] font-semibold text-emerald-600">
                          {tx('طلب', 'Claim')}
                        </p>
                        <p
                          className={cn(
                            'mt-0.5 text-sm font-extrabold num',
                            claim ? 'text-emerald-700' : 'text-slate-400'
                          )}
                        >
                          {formatCurrency(claim)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-rose-50/80 px-3 py-2.5">
                        <p className="text-[10px] font-semibold text-rose-600">
                          {tx('باقیات', 'Due')}
                        </p>
                        <p
                          className={cn(
                            'mt-0.5 text-sm font-extrabold num',
                            due ? 'text-rose-700' : 'text-slate-400'
                          )}
                        >
                          {formatCurrency(due)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-[11px] font-medium text-slate-500">
                        {tx('موجودی خالص', 'Net balance')}
                      </span>
                      <span className={cn('text-sm font-extrabold num', balanceClass(bal))}>
                        {formatCurrency(bal)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer extras */}
        {(summary.joint.length > 0 || summary.treasury.length > 0 || summary.exchangers.length > 8) && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-4 text-sm">
                {summary.joint.length > 0 ? (
                  <span className="text-slate-600">
                    {tx('مشترک', 'Joint')}:{' '}
                    <strong className="num text-slate-900">{formatCurrency(summary.jointTotal)}</strong>
                  </span>
                ) : null}
                {summary.treasury.length > 0 ? (
                  <span className="text-slate-600">
                    {tx('خزانه', 'Treasury')}:{' '}
                    <strong className="num text-slate-900">{formatCurrency(summary.treasuryTotal)}</strong>
                  </span>
                ) : null}
              </div>
              {summary.exchangers.length > 8 ? (
                <Link
                  href="/dashboard/exchange"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 hover:underline"
                >
                  {tx(`همه ${summary.exchangers.length} صرافی`, `All ${summary.exchangers.length} exchanges`)}
                  <Arrow className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
