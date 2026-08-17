'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { CompanyKey, JournalEntry } from '@/lib/demo-data';
import { formatCurrency } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';

const opLabel = {
  receipt: 'دریافت',
  payment: 'پرداخت',
  purchase: 'خرید',
  sale: 'فروش',
  transfer: 'انتقال',
  expense: 'هزینه',
  loan: 'قرضه',
  settlement: 'تسویه',
  other: 'سایر',
} as const;

const statusLabel: Record<string, string> = {
  received: 'دریافت‌شده',
  paid: 'پرداخت‌شده',
  pending: 'در انتظار',
};

const EMPTY: OpsRow[] = [];

export default function JournalPage() {
  const { company } = useCompanyStore();
  const items = useOpsStore((s) => (s.lists.journal ?? EMPTY) as unknown as JournalEntry[]);
  const addToList = useOpsStore((s) => s.addToList);
  const setList = useOpsStore((s) => s.setList);
  const [createOpen, setCreateOpen] = useState(false);
  const rows = items.filter((e) => matchesCompany(e.company, company));
  const receipts = rows
    .filter((r) => r.opType === 'receipt')
    .reduce((s, r) => s + r.amount, 0);
  const payments = rows
    .filter((r) => r.opType === 'payment' || r.opType === 'expense')
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="روزنامچه"
        description="ثبت عملیات روزانه — دهنده، گیرنده، تفصیلات، مبلغ/مقدار، تاریخ، وضعیت دریافت و پرداخت"
        actions={
          <>
            <ExportButtons
              filename="journal"
              title="روزنامچه"
              columns={[
                { key: 'number', label: 'شماره' },
                { key: 'dateJalali', label: 'تاریخ شمسی' },
                { key: 'dateGregorian', label: 'تاریخ میلادی' },
                { key: 'giver', label: 'دهنده' },
                { key: 'receiver', label: 'گیرنده' },
                { key: 'details', label: 'تفصیلات' },
                { key: 'amount', label: 'مبلغ' },
                { key: 'currency', label: 'ارز' },
                { key: 'opType', label: 'نوع عملیات' },
                { key: 'status', label: 'وضعیت' },
              ]}
              rows={rows.map((r) => ({
                number: r.number,
                dateJalali: r.dateJalali,
                dateGregorian: r.dateGregorian,
                giver: r.giver,
                receiver: r.receiver,
                details: r.details,
                amount: r.amount,
                currency: r.currency || 'USD',
                opType: opLabel[r.opType as keyof typeof opLabel] ?? r.opType,
                status: statusLabel[r.status] ?? r.status,
              }))}
            />
            <CompanySwitcher />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              ثبت جدید
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">جمع دریافتی</p>
            <p className="mt-1 text-xl font-bold num text-emerald-700">
              {formatCurrency(receipts)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">جمع پرداختی</p>
            <p className="mt-1 text-xl font-bold num text-red-600">
              {formatCurrency(payments)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">بیلانس روزنامچه</p>
            <p className="mt-1 text-xl font-bold num text-slate-900">
              {formatCurrency(receipts - payments)}
            </p>
          </CardContent>
        </Card>
      </div>

      {rows[0] ? (
        <Card>
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-slate-500">شماره روزنامچه</p>
              <p className="mt-1 font-bold num">{rows[0].number}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">تاریخ شمسی</p>
              <p className="mt-1 font-bold num">{rows[0].dateJalali}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">تاریخ میلادی</p>
              <p className="mt-1 font-bold num" dir="ltr">
                {rows[0].dateGregorian}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-3 space-y-0 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">دفتر روزنامچه</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="جستجو..." className="pr-9 h-9" />
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><BiLabel fa="شماره" en="No." /></TableHead>
                <TableHead><BiLabel fa="تاریخ شمسی" en="Jalali" /></TableHead>
                <TableHead><BiLabel fa="تاریخ میلادی" en="Gregorian" /></TableHead>
                <TableHead><BiLabel fa="دهنده" en="Payer" /></TableHead>
                <TableHead><BiLabel fa="گیرنده" en="Receiver" /></TableHead>
                <TableHead><BiLabel fa="تفصیلات" en="Details" /></TableHead>
                <TableHead><BiLabel fa="مبلغ / مقدار" en="Amount" /></TableHead>
                <TableHead><BiLabel fa="ارز" en="Currency" /></TableHead>
                <TableHead><BiLabel fa="نوع معامله" en="Txn type" /></TableHead>
                <TableHead><BiLabel fa="وضعیت" en="Status" /></TableHead>
                <TableHead><BiLabel fa="اتصال حساب" en="Linked account" /></TableHead>
                <TableHead className="text-center"><BiLabel fa="عملیات" en="Actions" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={12} message="هنوز عملیات روزنامچه‌ای ثبت نشده است" />
              ) : null}
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium num">{row.number}</TableCell>
                  <TableCell className="num">{row.dateJalali}</TableCell>
                  <TableCell className="num">{row.dateGregorian}</TableCell>
                  <TableCell>{row.giver}</TableCell>
                  <TableCell>{row.receiver}</TableCell>
                  <TableCell className="max-w-[220px] whitespace-normal">
                    {row.details}
                  </TableCell>
                  <TableCell className="num font-semibold">
                    {formatCurrency(row.amount, row.currency || 'USD')}
                  </TableCell>
                  <TableCell className="num">{row.currency || 'USD'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.opType === 'receipt'
                          ? 'success'
                          : row.opType === 'payment'
                            ? 'danger'
                            : row.opType === 'expense'
                              ? 'warning'
                              : 'info'
                      }
                    >
                      {opLabel[row.opType as keyof typeof opLabel] ?? row.opType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">
                      {statusLabel[row.status] ?? row.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {row.links?.customerId ? (
                        <Link
                          href={`/dashboard/customers/${row.links?.customerId}`}
                          className="text-xs text-[var(--brand)] hover:underline"
                        >
                          مشتری
                        </Link>
                      ) : null}
                      {row.links?.supplierId ? (
                        <Link
                          href={`/dashboard/suppliers/${row.links?.supplierId}`}
                          className="text-xs text-[var(--brand)] hover:underline"
                        >
                          تأمین‌کننده
                        </Link>
                      ) : null}
                      {row.links?.bank ? (
                        <Link href="/dashboard/finance/banks" className="text-xs text-[var(--brand)] hover:underline">بانک</Link>
                      ) : null}
                      {row.links?.cash ? (
                        <Link href="/dashboard/finance/cash" className="text-xs text-[var(--brand)] hover:underline">صندوق</Link>
                      ) : null}
                      {row.links?.exchangeId ? (
                        <Link
                          href={`/dashboard/exchange/${row.links?.exchangeId}`}
                          className="text-xs text-[var(--brand)] hover:underline"
                        >
                          صراف
                        </Link>
                      ) : null}
                      {row.links?.contractId ? (
                        <Link
                          href={`/dashboard/contracts/${row.links?.contractId}`}
                          className="text-xs text-[var(--brand)] hover:underline"
                        >
                          قرارداد
                        </Link>
                      ) : null}
                      {row.links?.saleId ? (
                        <Link href="/dashboard/sales" className="text-xs text-[var(--brand)] hover:underline">فروش</Link>
                      ) : null}
                      {row.links?.purchaseId ? (
                        <Link href="/dashboard/purchases" className="text-xs text-[var(--brand)] hover:underline">خرید</Link>
                      ) : null}
                      {row.links?.expenseId ? (
                        <Link href="/dashboard/finance/expenses" className="text-xs text-[var(--brand)] hover:underline">هزینه</Link>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RecordActions
                      title="سند روزنامچه"
                      row={{
                        number: row.number,
                        dateJalali: row.dateJalali,
                        giver: row.giver,
                        receiver: row.receiver,
                        details: row.details,
                        amount: row.amount,
                        status: row.status,
                      }}
                      fields={[
                        { key: 'number', label: 'شماره' },
                        { key: 'dateJalali', label: 'تاریخ' },
                        { key: 'giver', label: 'دهنده' },
                        { key: 'receiver', label: 'گیرنده' },
                        { key: 'details', label: 'تفصیلات', multiline: true },
                        { key: 'amount', label: 'مبلغ' },
                        { key: 'status', label: 'وضعیت' },
                      ]}
                      onSave={(next) => {
                        setList('journal',
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
                          })
                        );
                      }}
                      onDelete={() => setList('journal', items.filter((r) => r.id !== row.id) as unknown as OpsRow[])}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">هنوز عملیات روزنامچه‌ای ثبت نشده است</p>
              ) : (
                rows.map((row) => (
                  <MobileRecordCard
                    key={row.id}
                    title={row.details || opLabel[row.opType as keyof typeof opLabel]}
                    subtitle={`سند ${row.number} · ${row.dateJalali}`}
                    badge={
                      <Badge
                        variant={
                          row.opType === 'receipt'
                            ? 'success'
                            : row.opType === 'payment'
                              ? 'danger'
                              : row.opType === 'expense'
                                ? 'warning'
                                : 'info'
                        }
                      >
                        {opLabel[row.opType as keyof typeof opLabel] ?? row.opType}
                      </Badge>
                    }
                    metrics={[
                      {
                        label: 'مبلغ',
                        value: (
                          <span className={row.opType === 'receipt' ? 'text-emerald-700' : 'text-red-600'}>
                            {formatCurrency(row.amount, row.currency || 'USD')}
                          </span>
                        ),
                      },
                      { label: 'ارز', value: row.currency || 'USD' },
                      { label: 'وضعیت', value: statusLabel[row.status] ?? row.status },
                      { label: 'دهنده', value: row.giver },
                      { label: 'گیرنده', value: row.receiver },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="تاریخ میلادی" value={row.dateGregorian} />
                        <ExtraRow label="تفصیلات" value={row.details} />
                      </>
                    }
                    footer={
                      <RecordActions
                        layout="buttons"
                        title="سند روزنامچه"
                        row={{
                          number: row.number,
                          dateJalali: row.dateJalali,
                          giver: row.giver,
                          receiver: row.receiver,
                          details: row.details,
                          amount: row.amount,
                          status: row.status,
                        }}
                        fields={[
                          { key: 'number', label: 'شماره' },
                          { key: 'dateJalali', label: 'تاریخ' },
                          { key: 'giver', label: 'دهنده' },
                          { key: 'receiver', label: 'گیرنده' },
                          { key: 'details', label: 'تفصیلات', multiline: true },
                          { key: 'amount', label: 'مبلغ' },
                          { key: 'status', label: 'وضعیت' },
                        ]}
                        onSave={(next) => {
                          setList('journal',
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
                            })
                          );
                        }}
                        onDelete={() => setList('journal', items.filter((r) => r.id !== row.id) as unknown as OpsRow[])}
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
        title="ثبت روزنامچه"
        fields={[
          { key: 'number', label: 'شماره', required: true, dir: 'ltr' },
          { key: 'dateJalali', label: 'تاریخ' },
          { key: 'giver', label: 'دهنده', required: true },
          { key: 'receiver', label: 'گیرنده', required: true },
          { key: 'details', label: 'تفصیلات' },
          { key: 'amount', label: 'مبلغ', type: 'number', required: true },
          {
            key: 'opType',
            label: 'نوع',
            type: 'select',
            options: [
              { value: 'receipt', label: 'دریافت' },
              { value: 'payment', label: 'پرداخت' },
              { value: 'expense', label: 'هزینه' },
              { value: 'transfer', label: 'انتقال' },
            ],
          },
          {
            key: 'company',
            label: 'شرکت',
            type: 'select',
            options: [
              { value: 'arya', label: 'آریا' },
              { value: 'turkmen', label: 'ترکمن' },
            ],
          },
        ]}
        submitLabel="ثبت"
        onSubmit={(v) => {
          addToList('journal', {
            number: v.number.trim(),
            dateJalali: v.dateJalali,
            dateGregorian: '',
            giver: v.giver,
            receiver: v.receiver,
            details: v.details,
            amount: Number(v.amount || 0),
            currency: 'USD',
            opType: v.opType,
            status: v.opType === 'receipt' ? 'received' : 'paid',
            company: (v.company as CompanyKey) || 'arya',
          });
        }}
      />
    </div>
  );
}
