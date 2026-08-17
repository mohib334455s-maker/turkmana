'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Phone, Plus, Search, Users, Wallet, Boxes, AlertTriangle } from 'lucide-react';
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
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useCompanyStore } from '@/lib/company-store';
import { emptyGoods, goodsValue, products, sumGoods, type CustomerRecord } from '@/lib/demo-data';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, cn, formatCurrency, formatNumber } from '@/lib/utils';

type Customer = CustomerRecord;

export default function CustomersPage() {
  const { t } = useI18n();
  const { company } = useCompanyStore();
  const searchParams = useSearchParams();
  const storedCustomers = useOpsStore((s) => s.customers);
  const setCustomers = useOpsStore((s) => s.setCustomers);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', code: '', phone: '', creditLimit: '0' });
  const rows = storedCustomers;

  useEffect(() => {
    if (searchParams.get('new') === '1') setCreateOpen(true);
  }, [searchParams]);

  const mapped = useMemo(() => {
    return rows
      .map((c) => {
        const aryaCash = c.companies.arya.cashBalance;
        const turkCash = c.companies.turkmen.cashBalance;
        const cash =
          company === 'arya'
            ? aryaCash
            : company === 'turkmen'
              ? turkCash
              : aryaCash + turkCash;
        const goods =
          company === 'arya'
            ? c.companies.arya.goods
            : company === 'turkmen'
              ? c.companies.turkmen.goods
              : sumGoods(c.companies.arya.goods, c.companies.turkmen.goods);
        const goodsVal = goodsValue(goods);
        return { ...c, cash, goods, goodsVal };
      })
      .filter((c) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.phone.includes(q)
        );
      });
  }, [rows, company, query]);

  const colSpan = 7 + products.length;
  const totalCash = mapped.reduce((s, c) => s + c.cash, 0);
  const totalGoods = mapped.reduce((s, c) => s + c.goodsVal, 0);
  const debtors = mapped.filter((c) => c.cash < 0).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageCustomers')}
        description="لیست مشتریان — بیلانس، حساب نقدی، حساب جنسی، مقدار هر نوع کالا، وضعیت حساب"
        actions={
          <>
            <ExportButtons
              filename="customers"
              title="لیست مشتریان"
              columns={[
                { key: 'name', label: 'نام مشتری' },
                { key: 'code', label: 'کد' },
                { key: 'phone', label: 'تماس' },
                { key: 'cash', label: 'بیلانس نقدی' },
                { key: 'goodsVal', label: 'ارزش حساب جنسی' },
                ...products.map((p) => ({ key: p.code, label: p.name })),
                { key: 'lastTxn', label: 'آخرین معامله' },
                { key: 'status', label: 'وضعیت' },
              ]}
              rows={mapped.map((c) => ({
                name: c.name,
                code: c.code,
                phone: c.phone,
                cash: c.cash,
                goodsVal: c.goodsVal,
                ...Object.fromEntries(products.map((p) => [p.code, c.goods[p.code] ?? 0])),
                lastTxn: c.lastTxn,
                status: c.status,
              }))}
            />
            <CompanySwitcher />
            <Link href="/dashboard/customers/summary">
              <Button variant="outline">خلاصه دو شرکت</Button>
            </Link>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              مشتری جدید
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'تعداد مشتریان', value: String(mapped.length), icon: Users, tone: 'bg-violet-50 text-violet-600' },
          { label: 'جمع بیلانس نقدی', value: formatCurrency(totalCash), icon: Wallet, tone: 'bg-sky-50 text-sky-600', valueClass: balanceClass(totalCash) },
          { label: 'ارزش حساب جنسی', value: formatCurrency(totalGoods), icon: Boxes, tone: 'bg-teal-50 text-teal-600' },
          { label: 'مشتریان بدهکار', value: String(debtors), icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="rounded-[22px] border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <CardContent className="flex items-center gap-3 p-4">
                <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', k.tone)}>
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <p className={cn('mt-0.5 truncate text-lg font-bold num text-slate-900', k.valueClass)}>
                    {k.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-[22px] border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.045)]">
        <CardHeader className="flex-col gap-3 space-y-0 border-b border-slate-100 bg-slate-50/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">لیست مشتریان</CardTitle>
            <p className="mt-0.5 text-xs text-slate-500">پروفایل، بیلانس و وضعیت حساب هر مشتری</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="جستجوی نام یا کد..."
              className="h-10 rounded-xl border-slate-200 bg-white pr-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
                <TableHead>نام مشتری</TableHead>
                <TableHead>تماس</TableHead>
                <TableHead>بیلانس / حساب نقدی</TableHead>
                <TableHead>ارزش حساب جنسی</TableHead>
                {products.map((p) => (
                  <TableHead key={p.code}>
                    {p.name} ({p.unit})
                  </TableHead>
                ))}
                <TableHead>وضعیت حساب</TableHead>
                <TableHead>آخرین معامله</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mapped.length === 0 ? (
                <TableEmpty colSpan={colSpan + 1} message="هنوز مشتری ثبت نشده است" />
              ) : (
                mapped.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-white shadow-sm shadow-teal-200">
                          {c.name.slice(0, 1)}
                        </div>
                        <div>
                          <Link href={`/dashboard/customers/${c.id}`} className="font-semibold text-slate-900 hover:text-teal-700">
                            {c.name}
                          </Link>
                          <p className="text-xs text-slate-500 num">{c.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 num">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {c.phone}
                      </span>
                    </TableCell>
                    <TableCell className={`num font-semibold ${balanceClass(c.cash)}`}>
                      {formatCurrency(c.cash)}
                    </TableCell>
                    <TableCell className="num">{formatCurrency(c.goodsVal)}</TableCell>
                    {products.map((p) => (
                      <TableCell key={p.code} className="num">
                        {formatNumber(c.goods[p.code] ?? 0, 0)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Badge variant={c.cash < 0 ? 'danger' : c.status === 'warning' ? 'warning' : 'success'}>
                        {c.cash < 0 ? 'بدهکار' : c.status === 'warning' ? 'هشدار اعتبار' : 'بستانکار / فعال'}
                      </Badge>
                    </TableCell>
                    <TableCell className="num">{c.lastTxn}</TableCell>
                    <TableCell>
                      <RecordActions
                        title="مشتری"
                        detailHref={`/dashboard/customers/${c.id}`}
                        row={{
                          name: c.name,
                          code: c.code,
                          phone: c.phone,
                          creditLimit: c.creditLimit,
                          lastTxn: c.lastTxn,
                          status: c.status,
                        }}
                        fields={[
                          { key: 'name', label: 'نام' },
                          { key: 'code', label: 'کد' },
                          { key: 'phone', label: 'تلفن' },
                          { key: 'creditLimit', label: 'سقف اعتبار' },
                          { key: 'lastTxn', label: 'آخرین معامله' },
                          { key: 'status', label: 'وضعیت' },
                        ]}
                        onSave={(next) => {
                          setCustomers(
                          rows.map((r) =>
                              r.id === c.id
                                ? {
                                    ...r,
                                    name: String(next.name ?? r.name),
                                    code: String(next.code ?? r.code),
                                    phone: String(next.phone ?? r.phone),
                                    creditLimit: Number(next.creditLimit ?? r.creditLimit),
                                    lastTxn: String(next.lastTxn ?? r.lastTxn),
                                    status: String(next.status ?? r.status) as Customer['status'],
                                  }
                                : r
                            )
                          );
                        }}
                        onDelete={() => setCustomers(rows.filter((r) => r.id !== c.id))}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
              </div>
            }
            cards={
              mapped.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">هنوز مشتری ثبت نشده است</p>
              ) : (
                mapped.map((c) => (
                  <MobileRecordCard
                    key={c.id}
                    title={c.name}
                    subtitle={`${c.code} · ${c.phone}`}
                    badge={
                      <Badge variant={c.cash < 0 ? 'danger' : c.status === 'warning' ? 'warning' : 'success'}>
                        {c.cash < 0 ? 'بدهکار' : c.status === 'warning' ? 'هشدار اعتبار' : 'بستانکار'}
                      </Badge>
                    }
                    metrics={[
                      {
                        label: 'بیلانس نقدی',
                        value: (
                          <span className={balanceClass(c.cash)}>{formatCurrency(c.cash)}</span>
                        ),
                      },
                      { label: 'حساب جنسی', value: formatCurrency(c.goodsVal) },
                      { label: 'آخرین معامله', value: c.lastTxn },
                      { label: 'سقف اعتبار', value: formatCurrency(c.creditLimit) },
                    ]}
                    extra={products.map((p) => (
                      <ExtraRow
                        key={p.code}
                        label={`${p.name} (${p.unit})`}
                        value={formatNumber(c.goods[p.code] ?? 0, 0)}
                      />
                    ))}
                    footer={
                      <RecordActions
                        layout="buttons"
                        title="مشتری"
                        detailHref={`/dashboard/customers/${c.id}`}
                        row={{
                          name: c.name,
                          code: c.code,
                          phone: c.phone,
                          creditLimit: c.creditLimit,
                          lastTxn: c.lastTxn,
                          status: c.status,
                        }}
                        fields={[
                          { key: 'name', label: 'نام' },
                          { key: 'code', label: 'کد' },
                          { key: 'phone', label: 'تلفن' },
                          { key: 'creditLimit', label: 'سقف اعتبار' },
                          { key: 'lastTxn', label: 'آخرین معامله' },
                          { key: 'status', label: 'وضعیت' },
                        ]}
                        onSave={(next) => {
                          setCustomers(
                          rows.map((r) =>
                              r.id === c.id
                                ? {
                                    ...r,
                                    name: String(next.name ?? r.name),
                                    code: String(next.code ?? r.code),
                                    phone: String(next.phone ?? r.phone),
                                    creditLimit: Number(next.creditLimit ?? r.creditLimit),
                                    lastTxn: String(next.lastTxn ?? r.lastTxn),
                                    status: String(next.status ?? r.status) as Customer['status'],
                                  }
                                : r
                            )
                          );
                        }}
                        onDelete={() => setCustomers(rows.filter((r) => r.id !== c.id))}
                      />
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="مشتری جدید"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={() => {
                const id = rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
                setCustomers([
                  {
                    id,
                    code: draft.code || `CUST-${String(id).padStart(3, '0')}`,
                    name: draft.name,
                    phone: draft.phone,
                    creditLimit: Number(draft.creditLimit) || 0,
                    status: 'active',
                    lastTxn: '-',
                    companies: {
                      arya: { cashBalance: 0, goods: emptyGoods() },
                      turkmen: { cashBalance: 0, goods: emptyGoods() },
                    },
                  },
                  ...rows,
                ]);
                setCreateOpen(false);
                setDraft({ name: '', code: '', phone: '', creditLimit: '0' });
              }}
            >
              ذخیره
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <div>
            <Label>نام *</Label>
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <Label>کد</Label>
            <Input
              value={draft.code}
              onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div>
            <Label>تلفن</Label>
            <Input
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div>
            <Label>سقف اعتبار</Label>
            <Input
              type="number"
              value={draft.creditLimit}
              onChange={(e) => setDraft((d) => ({ ...d, creditLimit: e.target.value }))}
              dir="ltr"
              className="text-left"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
