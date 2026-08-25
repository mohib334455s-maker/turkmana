'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpFromLine, Plus, Warehouse } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useCompanyFormOptions } from '@/lib/use-company-form';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { todayIso } from '@/lib/purchase-flow';
import {
  formatJalali,
  formatJalaliWeekday,
  gregorianFromIso,
  parseIsoDate,
} from '@/lib/date-utils';
import { nextJournalBookNumber, nextLineOrder } from '@/lib/journal';
import type { CompanyKey, JournalEntry } from '@/lib/demo-data';
import type { OpsRow } from '@/lib/ops-store';

const EMPTY: OpsRow[] = [];

export default function LoadingUnloadPage() {
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const { defaultCompany } = useCompanyFormOptions();
  const warehouses = useOpsStore((s) => s.warehouseEntities);
  const items = useOpsStore((s) => (s.lists.journal ?? EMPTY) as unknown as JournalEntry[]);
  const addToList = useOpsStore((s) => s.addToList);
  const [open, setOpen] = useState<'loading' | 'unload' | null>(null);

  const whOptions = useMemo(
    () =>
      warehouses
        .filter((w) => matchesCompany(w.company, company))
        .map((w) => ({ value: String(w.id), label: w.name })),
    [warehouses, company]
  );

  const recent = useMemo(
    () =>
      items
        .filter(
          (r) =>
            matchesCompany(r.company, company) &&
            (r.opType === 'loading' || r.opType === 'unload')
        )
        .slice(0, 12),
    [items, company]
  );

  const post = (kind: 'loading' | 'unload', v: Record<string, string>) => {
    const dateIso = v.date || todayIso();
    const when = parseIsoDate(dateIso);
    const dayRows = items.filter(
      (r) => r.dateIso === dateIso || r.dateJalali === formatJalali(when)
    );
    const wh = warehouses.find((w) => String(w.id) === v.warehouseId);
    addToList('journal', {
      number: nextJournalBookNumber(dayRows),
      dateIso,
      dateJalali: formatJalali(when),
      dateGregorian: gregorianFromIso(dateIso),
      weekday: formatJalaliWeekday(when),
      giver: kind === 'unload' ? wh?.name || '' : v.party || '',
      receiver: kind === 'loading' ? wh?.name || '' : v.party || '',
      details:
        v.details ||
        (kind === 'loading'
          ? tx('بارگیری از ذخیره', 'Loading from storage')
          : tx('تخلیه به ذخیره', 'Unload into storage')),
      amount: 0,
      qty: Number(v.qty || 0),
      unit: v.unit || 'تن',
      currency: 'USD',
      opType: kind,
      status: 'posted',
      company: defaultCompany as CompanyKey,
      lineOrder: nextLineOrder(dayRows),
      links: {
        warehouseId: Number(v.warehouseId) || undefined,
      },
      marks: { office: false, accounting: false, supervisor: false, chief: false },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tx('بارگیری و تخلیه', 'Loading & unloading')}
        description={tx(
          'ثبت بارگیری/تخلیه در روزنامچه با اتصال به ذخیره — و دسترسی سریع به حواله فروش',
          'Post loading/unload to the day book linked to storage — plus quick access to sales deliveries'
        )}
        actions={<CompanySwitcher />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-[24px] border-emerald-100 shadow-none">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ArrowUpFromLine className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold">{tx('بارگیری', 'Loading')}</h2>
            <p className="text-sm text-slate-500">
              {tx(
                'خروج جنس از ذخیره — در روزنامچه با نوع «بارگیری» ثبت می‌شود',
                'Goods leaving storage — posted to journal as Loading'
              )}
            </p>
            <Button onClick={() => setOpen('loading')}>
              <Plus className="ms-2 h-4 w-4" />
              {tx('ثبت بارگیری', 'Post loading')}
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] border-sky-100 shadow-none">
          <CardContent className="space-y-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <ArrowDownToLine className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold">{tx('تخلیه', 'Unloading')}</h2>
            <p className="text-sm text-slate-500">
              {tx(
                'ورود جنس به ذخیره — در روزنامچه با نوع «تخلیه» ثبت می‌شود',
                'Goods entering storage — posted to journal as Unload'
              )}
            </p>
            <Button onClick={() => setOpen('unload')}>
              <Plus className="ms-2 h-4 w-4" />
              {tx('ثبت تخلیه', 'Post unload')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/warehouses">
          <Button variant="outline">
            <Warehouse className="ms-2 h-4 w-4" />
            {tx('ذخیره‌ها', 'Storages')}
          </Button>
        </Link>
        <Link href="/dashboard/sales/deliveries">
          <Button variant="outline">{tx('حواله خروج فروش', 'Sales deliveries')}</Button>
        </Link>
        <Link href="/dashboard/journal">
          <Button variant="outline">{tx('روزنامچه', 'Day book')}</Button>
        </Link>
      </div>

      <Card className="rounded-2xl shadow-none">
        <CardContent className="space-y-3 p-5">
          <p className="text-sm font-bold text-slate-800">
            {tx('آخرین بارگیری / تخلیه در روزنامچه', 'Recent loading / unload in journal')}
          </p>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">
              {tx('هنوز ثبت نشده', 'Nothing posted yet')}
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 px-3 py-2"
                >
                  <span>
                    <span className="font-semibold">
                      {r.opType === 'loading'
                        ? tx('بارگیری', 'Loading')
                        : tx('تخلیه', 'Unload')}
                    </span>
                    {' — '}
                    {r.details}
                  </span>
                  <span className="num text-slate-500">
                    {r.dateJalali} · {r.qty || 0} {r.unit || 'تن'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <CompactFormDialog
        open={open != null}
        onClose={() => setOpen(null)}
        title={
          open === 'loading'
            ? tx('ثبت بارگیری', 'Post loading')
            : tx('ثبت تخلیه', 'Post unload')
        }
        fields={[
          { key: 'date', label: tx('تاریخ', 'Date'), type: 'date', required: true },
          {
            key: 'warehouseId',
            label: tx('ذخیره', 'Storage'),
            type: 'select',
            required: true,
            options: whOptions.length
              ? whOptions
              : [{ value: '', label: tx('اول ذخیره بسازید', 'Create a storage first') }],
          },
          { key: 'party', label: tx('طرف / موتر / واگن', 'Party / truck / wagon') },
          { key: 'qty', label: tx('مقدار', 'Qty'), type: 'number', required: true },
          { key: 'unit', label: tx('واحد', 'Unit'), placeholder: 'تن' },
          { key: 'details', label: tx('تفصیلات', 'Details') },
        ]}
        initial={{ date: todayIso(), unit: 'تن', warehouseId: whOptions[0]?.value || '' }}
        submitLabel={tx('ثبت در روزنامچه', 'Post to journal')}
        onSubmit={(v) => {
          if (!open) return;
          post(open, v);
          setOpen(null);
        }}
      />
    </div>
  );
}
