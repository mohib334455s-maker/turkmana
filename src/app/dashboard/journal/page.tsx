'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  nextJournalBookNumber,
  type JournalLinks,
} from '@/lib/journal';
import {
  formatGregorian,
  formatJalali,
  formatJalaliWeekday,
  gregorianFromIso,
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
  const [createOpen, setCreateOpen] = useState(false);
  const [q, setQ] = useState('');

  const rows = items.filter((e) => matchesCompany(e.company, company));
  const filtered = rows.filter((r) => {
    if (!q.trim()) return true;
    const hay = `${r.number} ${r.giver} ${r.receiver} ${r.details} ${r.dateJalali}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  const todayJalali = formatJalali();
  const todayRows = rows.filter((r) => r.dateJalali === todayJalali);
  const header = todayRows[0] ?? rows[0];
  const receipts = rows.filter((r) => r.opType === 'receipt').reduce((s, r) => s + r.amount, 0);
  const payments = rows
    .filter((r) => r.opType === 'payment' || r.opType === 'expense')
    .reduce((s, r) => s + r.amount, 0);

  const companyTitle =
    company === 'turkmen'
      ? tx('روزنامچه دفتر شرکت ترکمن', 'Turkmen office journal')
      : tx('روزنامچه دفتر شرکت آریا', 'Arya office journal');

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
        ...contracts.map((c) => ({ value: String(c.id), label: `${c.number} — ${c.product}` })),
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
        ...warehouses.map((w) => ({ value: String(w.id), label: w.name })),
      ],
      exchanges: [
        { value: '', label: tx('بدون صراف', 'No exchange') },
        ...exchanges.map((h) => ({
          value: String(h.id),
          label: String(h.name || h.id),
        })),
      ],
    }),
    [customers, suppliers, contracts, parties, warehouses, exchanges, tx]
  );

  const defaultBook = todayRows[0]?.number || nextJournalBookNumber(rows);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageJournal')}
        description={tx(
          'دفتر روزانه — دهنده، گیرنده، تفصیلات، مبلغ یا مقدار (تن)، و تیک تأیید ه / ح / ن / ا. هر سند به حساب واقعی وصل می‌شود.',
          'Daily book — giver, receiver, details, amount or quantity (tons), and approval ticks. Each line links to a real account.'
        )}
        actions={
          <>
            <ExportButtons
              filename="journal"
              title={t('pageJournal')}
              columns={[
                { key: 'line', label: 'شماره' },
                { key: 'number', label: 'نمبر روزنامچه' },
                { key: 'dateJalali', label: 'تاریخ شمسی' },
                { key: 'dateGregorian', label: 'تاریخ میلادی' },
                { key: 'weekday', label: 'روز' },
                { key: 'giver', label: 'دهنده' },
                { key: 'receiver', label: 'گیرنده' },
                { key: 'details', label: 'تفصیلات' },
                { key: 'value', label: 'مبلغ / مقدار' },
                { key: 'opType', label: 'نوع عملیات' },
              ]}
              rows={filtered.map((r, i) => ({
                line: i + 1,
                number: r.number,
                dateJalali: r.dateJalali,
                dateGregorian: r.dateGregorian,
                weekday: r.weekday || '',
                giver: r.giver,
                receiver: r.receiver,
                details: r.details,
                value: displayValue(r),
                opType: opFa(r.opType),
              }))}
            />
            <CompanySwitcher />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              {tx('ثبت جدید', 'New entry')}
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden border-teal-100">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500">{tx('عنوان دفتر', 'Book title')}</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">{companyTitle}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{tx('نمبر', 'Serial')}</p>
            <p className="mt-1 font-bold num">({header?.number || defaultBook})</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{tx('تاریخ شمسی', 'Jalali')}</p>
            <p className="mt-1 font-bold num">{header?.dateJalali || todayJalali}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{tx('تاریخ میلادی / روز', 'Gregorian / day')}</p>
            <p className="mt-1 font-bold num" dir="ltr">
              {header?.dateGregorian || formatGregorian()} · {header?.weekday || formatJalaliWeekday()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('جمع دریافتی', 'Receipts')}</p>
            <p className="mt-1 text-xl font-bold num text-emerald-700">{formatCurrency(receipts)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('جمع پرداختی', 'Payments')}</p>
            <p className="mt-1 text-xl font-bold num text-red-600">{formatCurrency(payments)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('بیلانس روزنامچه', 'Journal balance')}</p>
            <p className="mt-1 text-xl font-bold num text-slate-900">
              {formatCurrency(receipts - payments)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">{tx('دفتر روزنامچه', 'Journal book')}</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={tx('جستجو...', 'Search...')}
              className="pr-9 h-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <BiLabel fa="شماره" en="No." />
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
                        <BiLabel fa="مبلغ / مقدار" en="Amount / qty" />
                      </TableHead>
                      {JOURNAL_MARK_META.map((m) => (
                        <TableHead key={m.key} className="w-10 text-center">
                          {m.fa}
                        </TableHead>
                      ))}
                      <TableHead>
                        <BiLabel fa="اتصال" en="Links" />
                      </TableHead>
                      <TableHead className="text-center">
                        <BiLabel fa="عملیات" en="Actions" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableEmpty
                        colSpan={10}
                        message={tx('هنوز عملیات روزنامچه‌ای ثبت نشده است', 'No journal lines yet')}
                      />
                    ) : null}
                    {filtered.map((row, i) => {
                      const marks = { ...emptyMarks(), ...row.marks };
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium num">{i + 1}</TableCell>
                          <TableCell>{row.giver || '—'}</TableCell>
                          <TableCell>{row.receiver || '—'}</TableCell>
                          <TableCell className="max-w-[280px] whitespace-normal text-sm">
                            <p>{row.details}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {row.dateJalali} · {opFa(row.opType)}
                            </p>
                          </TableCell>
                          <TableCell className="num font-semibold">{displayValue(row)}</TableCell>
                          {JOURNAL_MARK_META.map((m) => (
                            <TableCell key={m.key} className="text-center text-emerald-700">
                              {marks[m.key] ? '✓' : ''}
                            </TableCell>
                          ))}
                          <TableCell>
                            <JournalLinkChips links={row.links} />
                          </TableCell>
                          <TableCell>
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
                                dateJalali: row.dateJalali,
                                giver: row.giver,
                                receiver: row.receiver,
                                details: row.details,
                                amount: row.amount,
                                qty: row.qty ?? 0,
                              }}
                              fields={[
                                { key: 'number', label: tx('نمبر', 'Serial') },
                                { key: 'dateJalali', label: tx('تاریخ شمسی (دلخواه)', 'Jalali date') },
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
                                      dateJalali: String(next.dateJalali ?? r.dateJalali),
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              filtered.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {tx('هنوز عملیات روزنامچه‌ای ثبت نشده است', 'No journal lines yet')}
                </p>
              ) : (
                filtered.map((row, i) => (
                  <MobileRecordCard
                    key={row.id}
                    title={row.details || opFa(row.opType)}
                    subtitle={`${tx('نمبر', 'No.')} ${i + 1} · ${row.dateJalali}`}
                    badge={<Badge variant="info">{opFa(row.opType)}</Badge>}
                    metrics={[
                      { label: tx('مبلغ / مقدار', 'Amount / qty'), value: displayValue(row) },
                      { label: tx('دهنده', 'Giver'), value: row.giver || '—' },
                      { label: tx('گیرنده', 'Receiver'), value: row.receiver || '—' },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={tx('تاریخ میلادی', 'Gregorian')} value={row.dateGregorian} />
                        <ExtraRow
                          label={tx('اتصال', 'Links')}
                          value={<JournalLinkChips links={row.links} />}
                        />
                      </>
                    }
                    footer={
                      <RecordActions
                        layout="buttons"
                        title={tx('سند روزنامچه', 'Journal voucher')}
                        row={{
                          number: row.number,
                          dateJalali: row.dateJalali,
                          giver: row.giver,
                          receiver: row.receiver,
                          details: row.details,
                          amount: row.amount,
                        }}
                        fields={[
                          { key: 'number', label: tx('نمبر', 'Serial') },
                          { key: 'dateJalali', label: tx('تاریخ', 'Date') },
                          { key: 'giver', label: tx('دهنده', 'Giver') },
                          { key: 'receiver', label: tx('گیرنده', 'Receiver') },
                          { key: 'details', label: tx('تفصیلات', 'Details'), multiline: true },
                          { key: 'amount', label: tx('مبلغ', 'Amount') },
                        ]}
                        onSave={(next) => {
                          setList(
                            'journal',
                            items.map((r) => {
                              if (r.id !== row.id) return r;
                              return {
                                ...r,
                                number: String(next.number ?? r.number),
                                dateJalali: String(next.dateJalali ?? r.dateJalali),
                                giver: String(next.giver ?? r.giver),
                                receiver: String(next.receiver ?? r.receiver),
                                details: String(next.details ?? r.details),
                                amount: Number(next.amount ?? r.amount),
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
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={tx('ثبت روزنامچه', 'Post journal')}
        description={tx(
          'مقدار جنسی (تن) یا مبلغ نقدی — و اتصال به پارتی، قرارداد، ذخیره، مشتری یا تأمین‌کننده.',
          'Quantity (tons) or cash amount — and a link to party, contract, storage, customer or vendor.'
        )}
        size="xl"
        fields={[
          { key: 'number', label: tx('نمبر روزنامچه', 'Journal serial'), required: true, dir: 'ltr' },
          { key: 'date', label: tx('تاریخ', 'Date'), type: 'date', required: true },
          { key: 'giver', label: tx('دهنده', 'Giver') },
          { key: 'receiver', label: tx('گیرنده', 'Receiver') },
          { key: 'details', label: tx('تفصیلات', 'Details'), required: true },
          { key: 'qty', label: tx('مقدار', 'Qty'), type: 'number' },
          { key: 'unit', label: tx('واحد', 'Unit'), placeholder: 'تن' },
          { key: 'amount', label: tx('مبلغ', 'Amount'), type: 'number' },
          {
            key: 'opType',
            label: tx('نوع', 'Type'),
            type: 'select',
            options: Object.entries(JOURNAL_OP_LABELS).map(([value, lab]) => ({
              value,
              label: lab.fa,
            })),
          },
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
            label: tx('ذخیره', 'Storage'),
            type: 'select',
            options: linkOptions.warehouses,
          },
          {
            key: 'exchangeId',
            label: tx('صراف', 'Exchange'),
            type: 'select',
            options: linkOptions.exchanges,
          },
          {
            key: 'bank',
            label: tx('بانک', 'Bank'),
            type: 'checkbox',
            placeholder: tx('وصل به بانک', 'Link to banks'),
          },
          {
            key: 'cash',
            label: tx('صندوق', 'Cash'),
            type: 'checkbox',
            placeholder: tx('وصل به صندوق', 'Link to cash'),
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
          date: todayIso(),
          unit: 'تن',
          opType: 'other',
          company: defaultCompany,
        }}
        submitLabel={tx('ثبت', 'Post')}
        onSubmit={(v) => {
          const when = parseIsoDate(v.date || todayIso());
          const links: JournalLinks = {};
          if (Number(v.customerId)) links.customerId = Number(v.customerId);
          if (Number(v.supplierId)) links.supplierId = Number(v.supplierId);
          if (Number(v.contractId)) links.contractId = Number(v.contractId);
          if (Number(v.partyId)) links.partyId = Number(v.partyId);
          if (Number(v.warehouseId)) links.warehouseId = Number(v.warehouseId);
          if (Number(v.exchangeId)) links.exchangeId = Number(v.exchangeId);
          if (v.bank === '1') links.bank = true;
          if (v.cash === '1') links.cash = true;
          addToList('journal', {
            number: v.number.trim(),
            dateJalali: formatJalali(when),
            dateGregorian: gregorianFromIso(v.date || todayIso()),
            weekday: formatJalaliWeekday(when),
            giver: v.giver,
            receiver: v.receiver,
            details: v.details,
            amount: Number(v.amount || 0),
            qty: Number(v.qty || 0),
            unit: v.unit || 'تن',
            currency: 'USD',
            opType: v.opType,
            status: v.opType === 'receipt' ? 'received' : 'posted',
            company: (v.company as CompanyKey) || defaultCompany,
            links,
            marks: {
              office: v.markH === '1',
              accounting: v.markA === '1',
              supervisor: v.markN === '1',
              chief: v.markC === '1',
            },
          });
        }}
      />
    </div>
  );
}
