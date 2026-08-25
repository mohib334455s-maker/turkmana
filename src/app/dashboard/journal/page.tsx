'use client';

import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  CalendarDays,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { RecordActions } from '@/components/shared/record-actions';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { JournalLinkChips } from '@/components/journal/related-journal';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useCompanyFormOptions } from '@/lib/use-company-form';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { CompanyKey, JournalEntry } from '@/lib/demo-data';
import { formatCurrency } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';
import { useI18n } from '@/lib/i18n/store';
import {
  emptyMarks,
  formatJournalValue,
  JOURNAL_MARK_META,
  JOURNAL_OP_LABELS,
  lineOrderBetween,
  nextJournalBookNumber,
  nextLineOrder,
  sortDayRows,
  type JournalLinks,
} from '@/lib/journal';
import { CHART_ACCOUNT_CATALOG, CHART_KIND_LABELS } from '@/lib/chart-accounts';
import {
  formatGregorian,
  formatJalali,
  formatJalaliWeekday,
  parseIsoDate,
} from '@/lib/date-utils';
import { todayIso } from '@/lib/purchase-flow';

const EMPTY: OpsRow[] = [];

function opFa(type: string) {
  return JOURNAL_OP_LABELS[type]?.fa ?? type;
}

function displayValue(row: JournalEntry) {
  const qty = formatJournalValue({
    qty: row.qty ?? 0,
    unit: row.unit || 'تن',
    amount: row.amount,
    currency: row.currency || 'USD',
  });
  return qty || formatCurrency(row.amount, row.currency || 'USD');
}

function shiftIso(iso: string, days: number) {
  const d = parseIsoDate(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function JournalPage() {
  const { t, tx } = useI18n();
  const { company } = useCompanyStore();
  const { options: companyOptions, defaultCompany, showCompanyField } =
    useCompanyFormOptions();
  const items = useOpsStore((s) => (s.lists.journal ?? EMPTY) as unknown as JournalEntry[]);
  const addToList = useOpsStore((s) => s.addToList);
  const setList = useOpsStore((s) => s.setList);
  const customers = useOpsStore((s) => s.customers);
  const suppliers = useOpsStore((s) => s.suppliers);
  const contracts = useOpsStore((s) => s.contracts);
  const warehouses = useOpsStore((s) => s.warehouseEntities);
  const parties = useOpsStore((s) => s.lists.parties ?? EMPTY);
  const exchanges = useOpsStore((s) => s.lists.exchangeHouses ?? EMPTY);
  const banks = useOpsStore((s) => (s.lists.banks ?? EMPTY) as OpsRow[]);
  const ledger = useOpsStore((s) => (s.lists.ledgerAccounts ?? EMPTY) as OpsRow[]);

  const [dayIso, setDayIso] = useState(todayIso());
  const [q, setQ] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [insertAfterId, setInsertAfterId] = useState<number | null>(null);

  const dayDate = parseIsoDate(dayIso);
  const dayJalali = formatJalali(dayDate);
  const dayGregorian = formatGregorian(dayDate);
  const dayWeekday = formatJalaliWeekday(dayDate);

  const companyRows = useMemo(
    () => items.filter((e) => matchesCompany(e.company, company)),
    [items, company]
  );

  const dayRows = useMemo(() => {
    const matched = companyRows.filter((r) => {
      if (r.dateIso) return r.dateIso === dayIso;
      return r.dateJalali === dayJalali;
    });
    return sortDayRows(matched);
  }, [companyRows, dayIso, dayJalali]);

  const filtered = useMemo(() => {
    if (!q.trim()) return dayRows;
    const needle = q.trim().toLowerCase();
    return dayRows.filter((r) =>
      `${r.number} ${r.giver} ${r.receiver} ${r.details} ${r.opType}`
        .toLowerCase()
        .includes(needle)
    );
  }, [dayRows, q]);

  const receipts = dayRows
    .filter((r) => r.opType === 'receipt')
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const payments = dayRows
    .filter((r) => r.opType === 'payment' || r.opType === 'expense')
    .reduce((s, r) => s + (Number(r.amount) || 0), 0);

  const companyTitle =
    company === 'turkmen'
      ? tx('روزنامچه ترکمن پطرولیم', 'Turkmen Petroleum day book')
      : tx('روزنامچه آزیا آریا لمتید', 'Azya Aria LTD day book');

  const chartOptions = useMemo(() => {
    const fromStore = ledger
      .filter((a) => matchesCompany(String(a.company), company))
      .map((a) => ({
        value: String(a.id),
        label: `${a.code || ''} — ${a.name || a.id}`,
      }));
    if (fromStore.length) {
      return [{ value: '', label: tx('بدون حساب دفتر کل', 'No ledger account') }, ...fromStore];
    }
    return [
      { value: '', label: tx('بدون حساب دفتر کل', 'No ledger account') },
      ...CHART_ACCOUNT_CATALOG.map((a) => ({
        value: a.code,
        label: `${a.code} — ${a.nameFa} (${CHART_KIND_LABELS[a.kind].fa})`,
      })),
    ];
  }, [ledger, company, tx]);

  const linkOptions = useMemo(
    () => ({
      customers: [
        { value: '', label: tx('بدون مشتری', 'No customer') },
        ...customers.map((c) => ({ value: String(c.id), label: c.name })),
      ],
      suppliers: [
        { value: '', label: tx('بدون تأمین‌کننده', 'No vendor') },
        ...suppliers.map((s) => ({ value: String(s.id), label: s.name })),
      ],
      contracts: [
        { value: '', label: tx('بدون قرارداد', 'No contract') },
        ...contracts
          .filter((c) => matchesCompany(c.company, company))
          .map((c) => ({ value: String(c.id), label: `${c.number} — ${c.product}` })),
      ],
      parties: [
        { value: '', label: tx('بدون پارتی', 'No party') },
        ...parties.map((p) => ({
          value: String(p.id),
          label: String(p.number || p.partyNumber || p.id),
        })),
      ],
      warehouses: [
        { value: '', label: tx('بدون ذخیره', 'No storage') },
        ...warehouses
          .filter((w) => matchesCompany(w.company, company))
          .map((w) => ({ value: String(w.id), label: w.name })),
      ],
      exchanges: [
        { value: '', label: tx('بدون صراف', 'No exchange') },
        ...exchanges
          .filter((h) => matchesCompany(String(h.company), company))
          .map((h) => ({
            value: String(h.id),
            label: String(h.name || h.id),
          })),
      ],
      banks: [
        { value: '', label: tx('بدون بانک', 'No bank') },
        ...banks
          .filter((b) => matchesCompany(String(b.company), company))
          .map((b) => ({
            value: String(b.id),
            label: String(b.name || b.bankName || b.id),
          })),
      ],
      chart: chartOptions,
    }),
    [
      customers,
      suppliers,
      contracts,
      parties,
      warehouses,
      exchanges,
      banks,
      chartOptions,
      company,
      tx,
    ]
  );

  const defaultBook = nextJournalBookNumber(dayRows);

  const openCreate = (afterId: number | null = null) => {
    setInsertAfterId(afterId);
    setCreateOpen(true);
  };

  const buildLinks = (v: Record<string, string>): JournalLinks => {
    const links: JournalLinks = {};
    if (Number(v.customerId)) links.customerId = Number(v.customerId);
    if (Number(v.supplierId)) links.supplierId = Number(v.supplierId);
    if (Number(v.contractId)) links.contractId = Number(v.contractId);
    if (Number(v.partyId)) links.partyId = Number(v.partyId);
    if (Number(v.warehouseId)) links.warehouseId = Number(v.warehouseId);
    if (Number(v.exchangeId)) links.exchangeId = Number(v.exchangeId);
    if (Number(v.bankAccountId)) links.bankAccountId = Number(v.bankAccountId);
    if (v.cash === '1') links.cash = true;
    if (v.ledgerAccountId) {
      const n = Number(v.ledgerAccountId);
      if (Number.isFinite(n) && n > 0) links.ledgerAccountId = n;
      else {
        const acc = CHART_ACCOUNT_CATALOG.find((a) => a.code === v.ledgerAccountId);
        if (acc?.kind === 'partner') links.partnerAccountId = 1;
        if (acc?.kind === 'misc_receivable') links.miscReceivableId = 1;
        if (acc?.kind === 'asset') links.assetAccountId = 1;
        if (acc?.kind === 'depreciation') links.depreciationAccountId = 1;
      }
    }
    return links;
  };

  const autoNamesFromLinks = (v: Record<string, string>) => {
    let giver = v.giver?.trim() || '';
    let receiver = v.receiver?.trim() || '';
    const cust = customers.find((c) => String(c.id) === v.customerId);
    const sup = suppliers.find((s) => String(s.id) === v.supplierId);
    if (v.opType === 'receipt' && cust && !giver) giver = cust.name;
    if (v.opType === 'payment' && sup && !receiver) receiver = sup.name;
    if (cust && !giver && !receiver) giver = cust.name;
    if (sup && !receiver) receiver = sup.name;
    return { giver, receiver };
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title={t('pageJournal')}
        description={t('pageJournalDesc')}
        actions={
          <>
            <ExportButtons
              filename={`journal-${dayIso}`}
              title={`${t('pageJournal')} — ${dayJalali}`}
              columns={[
                { key: 'line', label: 'شماره' },
                { key: 'number', label: 'نمبر' },
                { key: 'dateJalali', label: 'شمسی' },
                { key: 'dateGregorian', label: 'میلادی' },
                { key: 'giver', label: 'دهنده' },
                { key: 'receiver', label: 'گیرنده' },
                { key: 'details', label: 'تفصیلات' },
                { key: 'value', label: 'مبلغ / مقدار' },
                { key: 'opType', label: 'نوع' },
              ]}
              rows={filtered.map((r, i) => ({
                line: i + 1,
                number: r.number,
                dateJalali: r.dateJalali,
                dateGregorian: r.dateGregorian,
                giver: r.giver,
                receiver: r.receiver,
                details: r.details,
                value: displayValue(r),
                opType: opFa(r.opType),
              }))}
            />
            <CompanySwitcher />
            <Button onClick={() => openCreate(null)}>
              <Plus className="ms-2 h-4 w-4" />
              {tx('سطر جدید', 'New line')}
            </Button>
          </>
        }
      />

      {/* Day picker — Shamsi + Gregorian */}
      <Card className="overflow-hidden rounded-[24px] border-indigo-100 shadow-none">
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500">{tx('عنوان دفتر', 'Book')}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{companyTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setDayIso(shiftIso(dayIso, -1))}
                title={tx('روز قبل', 'Previous day')}
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setDayIso(todayIso())}
              >
                {tx('امروز', 'Today')}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setDayIso(shiftIso(dayIso, 1))}
                title={tx('روز بعد', 'Next day')}
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                {tx('انتخاب تاریخ (میلادی)', 'Pick date (Gregorian)')}
              </Label>
              <Input
                type="date"
                dir="ltr"
                className="mt-1.5"
                value={dayIso}
                onChange={(e) => setDayIso(e.target.value || todayIso())}
              />
            </div>
            <div className="rounded-xl border border-teal-100 bg-teal-50/60 px-4 py-3">
              <p className="text-[11px] font-medium text-teal-800">
                {tx('تاریخ شمسی', 'Jalali')}
              </p>
              <p className="mt-1 text-lg font-extrabold num text-teal-950">{dayJalali}</p>
              <p className="text-xs text-teal-700">{dayWeekday}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-medium text-slate-500">
                {tx('تاریخ میلادی', 'Gregorian')}
              </p>
              <p className="mt-1 text-lg font-extrabold num text-slate-900" dir="ltr">
                {dayGregorian}
              </p>
              <p className="text-xs text-slate-500">
                {tx('تعداد سطر', 'Lines')}: <span className="num font-bold">{dayRows.length}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl border-emerald-100 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('دریافتی همین روز', 'Day receipts')}</p>
            <p className="mt-1 text-xl font-bold num text-emerald-700">{formatCurrency(receipts)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-rose-100 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('پرداختی همین روز', 'Day payments')}</p>
            <p className="mt-1 text-xl font-bold num text-rose-600">{formatCurrency(payments)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('بیلانس روز', 'Day balance')}</p>
            <p className="mt-1 text-xl font-bold num text-slate-900">
              {formatCurrency(receipts - payments)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-[22px] border-slate-200 shadow-none">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <p className="text-sm font-extrabold text-slate-900">
            {tx('معاملات روز', 'Day transactions')} — {dayJalali}
          </p>
          <div className="relative w-full sm:w-56">
            <Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={tx('جستجو در همین روز…', 'Search this day…')}
              className="h-9 pe-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>

        <ResponsiveData
          table={
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[6%]">
                      <BiLabel fa="ش" en="#" />
                    </TableHead>
                    <TableHead>
                      <BiLabel fa="دهنده" en="Giver" />
                    </TableHead>
                    <TableHead>
                      <BiLabel fa="گیرنده" en="Receiver" />
                    </TableHead>
                    <TableHead>
                      <BiLabel fa="تفصیلات" en="Details" />
                    </TableHead>
                    <TableHead>
                      <BiLabel fa="مبلغ / مقدار" en="Amount" />
                    </TableHead>
                    {JOURNAL_MARK_META.map((m) => (
                      <TableHead key={m.key} className="w-9 text-center">
                        {m.fa}
                      </TableHead>
                    ))}
                    <TableHead>
                      <BiLabel fa="اتصال" en="Links" />
                    </TableHead>
                    <TableHead className="text-center w-[14%]">
                      <BiLabel fa="عملیات" en="Actions" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableEmpty
                      colSpan={10}
                      message={tx(
                        'برای این روز سطر نیست — «سطر جدید» را بزنید',
                        'No lines for this day — add a new line'
                      )}
                    />
                  ) : null}
                  {filtered.map((row, i) => {
                    const marks = { ...emptyMarks(), ...row.marks };
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="num font-medium text-slate-500">{i + 1}</TableCell>
                        <TableCell className="font-semibold">{row.giver || '—'}</TableCell>
                        <TableCell>{row.receiver || '—'}</TableCell>
                        <TableCell className="max-w-[260px] whitespace-normal text-sm">
                          <p>{row.details}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {opFa(row.opType)}
                            {row.number ? ` · #${row.number}` : ''}
                          </p>
                        </TableCell>
                        <TableCell className="num font-semibold">{displayValue(row)}</TableCell>
                        {JOURNAL_MARK_META.map((m) => (
                          <TableCell key={m.key} className="text-center text-emerald-700">
                            {marks[m.key] ? '✓' : ''}
                          </TableCell>
                        ))}
                        <TableCell>
                          <JournalLinkChips links={row.links as JournalLinks} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-[11px]"
                              title={tx('افزودن سطر بعد از این', 'Insert below')}
                              onClick={() => openCreate(row.id)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                            <RecordActions
                              title={tx('سند روزنامچه', 'Journal voucher')}
                              activity={{
                                module: 'journal',
                                moduleFa: 'روزنامچه',
                                moduleEn: 'Journal',
                                entityLabelFa: 'سند',
                                entityLabelEn: 'Voucher',
                                entityName: 'number',
                              }}
                              row={{
                                number: row.number,
                                giver: row.giver,
                                receiver: row.receiver,
                                details: row.details,
                                amount: row.amount,
                                qty: row.qty ?? 0,
                              }}
                              fields={[
                                { key: 'number', label: tx('نمبر', 'Serial') },
                                { key: 'giver', label: tx('دهنده', 'Giver') },
                                { key: 'receiver', label: tx('گیرنده', 'Receiver') },
                                { key: 'details', label: tx('تفصیلات', 'Details'), multiline: true },
                                { key: 'amount', label: tx('مبلغ', 'Amount'), type: 'number' },
                                { key: 'qty', label: tx('مقدار', 'Qty'), type: 'number' },
                              ]}
                              onSave={(next) => {
                                setList(
                                  'journal',
                                  items.map((r) => {
                                    if (r.id !== row.id) return r;
                                    return {
                                      ...r,
                                      number: String(next.number ?? r.number),
                                      giver: String(next.giver ?? r.giver),
                                      receiver: String(next.receiver ?? r.receiver),
                                      details: String(next.details ?? r.details),
                                      amount: Number(next.amount ?? r.amount),
                                      qty: Number(next.qty ?? r.qty ?? 0),
                                    };
                                  }) as unknown as OpsRow[]
                                );
                              }}
                              onDelete={() =>
                                setList(
                                  'journal',
                                  items.filter((r) => r.id !== row.id) as unknown as OpsRow[]
                                )
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filtered.length > 0 ? (
                <div className="border-t border-dashed border-slate-200 px-4 py-3 text-center">
                  <Button variant="outline" size="sm" onClick={() => openCreate(null)}>
                    <Plus className="ms-2 h-4 w-4" />
                    {tx('افزودن در انتهای روز', 'Add at end of day')}
                  </Button>
                </div>
              ) : null}
            </div>
          }
          cards={
            <div className="space-y-3 px-3 py-3">
              {filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {tx('برای این روز سطر نیست', 'No lines for this day')}
                </p>
              ) : (
                filtered.map((row, i) => (
                  <MobileRecordCard
                    key={row.id}
                    title={row.details || opFa(row.opType)}
                    subtitle={`${tx('سطر', 'Line')} ${i + 1}`}
                    badge={<Badge variant="info">{opFa(row.opType)}</Badge>}
                    metrics={[
                      { label: tx('مبلغ / مقدار', 'Amount'), value: displayValue(row) },
                      { label: tx('دهنده', 'Giver'), value: row.giver || '—' },
                      { label: tx('گیرنده', 'Receiver'), value: row.receiver || '—' },
                    ]}
                    extra={
                      <>
                        <ExtraRow
                          label={tx('اتصال', 'Links')}
                          value={<JournalLinkChips links={row.links as JournalLinks} />}
                        />
                      </>
                    }
                    footer={
                      <Button size="sm" variant="outline" onClick={() => openCreate(row.id)}>
                        <Plus className="ms-2 h-4 w-4" />
                        {tx('سطر بعد', 'Insert below')}
                      </Button>
                    }
                  />
                ))
              )}
              <Button className="w-full" onClick={() => openCreate(null)}>
                <Plus className="ms-2 h-4 w-4" />
                {tx('سطر جدید', 'New line')}
              </Button>
            </div>
          }
        />
      </Card>

      <CompactFormDialog
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setInsertAfterId(null);
        }}
        title={
          insertAfterId
            ? tx('سطر جدید بین معاملات', 'Insert line between entries')
            : tx('ثبت سطر روزنامچه', 'Post journal line')
        }
        description={tx(
          'مشتری، تأمین‌کننده، صرافی، بانک، شرکا، دارایی و … را وصل کنید تا در همان حساب ثبت شود.',
          'Link customer, vendor, exchange, bank, partners, assets, etc. so the line posts to that account.'
        )}
        size="xl"
        fields={[
          { key: 'number', label: tx('نمبر روزنامچه', 'Serial'), required: true, dir: 'ltr' },
          {
            key: 'opType',
            label: tx('نوع عملیات', 'Operation'),
            type: 'select',
            options: Object.entries(JOURNAL_OP_LABELS).map(([value, lab]) => ({
              value,
              label: lab.fa,
            })),
          },
          { key: 'giver', label: tx('دهنده', 'Giver') },
          { key: 'receiver', label: tx('گیرنده', 'Receiver') },
          { key: 'details', label: tx('تفصیلات', 'Details'), required: true },
          { key: 'qty', label: tx('مقدار', 'Qty'), type: 'number' },
          { key: 'unit', label: tx('واحد', 'Unit'), placeholder: 'تن' },
          { key: 'amount', label: tx('مبلغ', 'Amount'), type: 'number' },
          {
            key: 'customerId',
            label: tx('مشتری', 'Customer'),
            type: 'select',
            options: linkOptions.customers,
          },
          {
            key: 'supplierId',
            label: tx('تأمین‌کننده', 'Vendor'),
            type: 'select',
            options: linkOptions.suppliers,
          },
          {
            key: 'exchangeId',
            label: tx('صرافی', 'Exchange'),
            type: 'select',
            options: linkOptions.exchanges,
          },
          {
            key: 'bankAccountId',
            label: tx('بانک', 'Bank'),
            type: 'select',
            options: linkOptions.banks,
          },
          {
            key: 'cash',
            label: tx('صندوق / خزانه', 'Cash / treasury'),
            type: 'checkbox',
            placeholder: tx('وصل به صندوق', 'Link cash'),
          },
          {
            key: 'contractId',
            label: tx('قرارداد', 'Contract'),
            type: 'select',
            options: linkOptions.contracts,
          },
          {
            key: 'partyId',
            label: tx('پارتی', 'Party'),
            type: 'select',
            options: linkOptions.parties,
          },
          {
            key: 'warehouseId',
            label: tx('ذخیره / بارگیری', 'Storage / loading'),
            type: 'select',
            options: linkOptions.warehouses,
          },
          {
            key: 'ledgerAccountId',
            label: tx('حساب دفتر کل (شرکا / دارایی / استهلاک / طلبات متفرقه)', 'Ledger account'),
            type: 'select',
            options: linkOptions.chart,
          },
          { key: 'markH', label: 'ه', type: 'checkbox', placeholder: 'ه' },
          { key: 'markA', label: 'ح', type: 'checkbox', placeholder: 'ح' },
          { key: 'markN', label: 'ن', type: 'checkbox', placeholder: 'ن' },
          { key: 'markC', label: 'ا', type: 'checkbox', placeholder: 'ا' },
          ...(showCompanyField
            ? [
                {
                  key: 'company',
                  label: tx('شرکت', 'Company'),
                  type: 'select' as const,
                  options: companyOptions,
                },
              ]
            : []),
        ]}
        initial={{
          number: defaultBook,
          unit: 'تن',
          opType: 'receipt',
          company: defaultCompany,
        }}
        submitLabel={tx('ثبت در همین روز', 'Post to this day')}
        onSubmit={(v) => {
          const when = dayDate;
          const links = buildLinks(v);
          const names = autoNamesFromLinks(v);
          const afterIdx = insertAfterId
            ? dayRows.findIndex((r) => r.id === insertAfterId)
            : -1;
          const prev = afterIdx >= 0 ? dayRows[afterIdx] : dayRows[dayRows.length - 1];
          const next = afterIdx >= 0 ? dayRows[afterIdx + 1] : undefined;
          const lineOrder =
            afterIdx >= 0
              ? lineOrderBetween(prev, next)
              : nextLineOrder(dayRows);

          addToList('journal', {
            number: v.number.trim() || defaultBook,
            dateIso: dayIso,
            dateJalali: dayJalali,
            dateGregorian: dayGregorian,
            weekday: dayWeekday,
            giver: names.giver,
            receiver: names.receiver,
            details: v.details,
            amount: Number(v.amount || 0),
            qty: Number(v.qty || 0),
            unit: v.unit || 'تن',
            currency: 'USD',
            opType: v.opType,
            status: v.opType === 'receipt' ? 'received' : 'posted',
            company: (v.company as CompanyKey) || defaultCompany,
            lineOrder,
            links,
            marks: {
              office: v.markH === '1',
              accounting: v.markA === '1',
              supervisor: v.markN === '1',
              chief: v.markC === '1',
            },
          });
          setInsertAfterId(null);
        }}
      />
    </div>
  );
}
