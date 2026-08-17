'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FileText,
  Phone,
  Printer,
  Plus,
  Wallet,
  Boxes,
  BadgeCheck,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExportButtons } from '@/components/shared/export-buttons';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { customerTxnLabels, resaleProfitPerTon } from '@/lib/customer-ledger';
import { customerLedgers, products } from '@/lib/demo-data';
import { useOpsStore } from '@/lib/ops-store';
import { balanceClass, cn, formatCurrency, formatNumber } from '@/lib/utils';

const txnBadgeVariant = (txnType: string) => {
  if (txnType === 'takeback') return 'warning' as const;
  if (txnType === 'resale') return 'info' as const;
  if (txnType === 'purchase') return 'success' as const;
  return 'muted' as const;
};

export default function CustomerLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const customerId = Number(id);
  const { company } = useCompanyStore();
  const customer = useOpsStore((s) => s.customers.find((c) => c.id === customerId));
  const ledger = (customerLedgers[customerId] ?? []).filter((r) =>
    matchesCompany(r.company, company)
  );

  if (!customer) {
    return (
      <div className="space-y-4">
        <p>مشتری یافت نشد.</p>
        <Link href="/dashboard/customers">
          <Button variant="outline">بازگشت</Button>
        </Link>
      </div>
    );
  }

  const cashBalance = ledger.at(-1)?.cashBalance ?? 0;
  const goodsBalance = ledger.at(-1)?.goodsBalance ?? 0;
  const resaleRows = ledger.filter((r) => r.txnType === 'resale' || r.txnType === 'takeback');
  const resaleProfit = ledger
    .filter((r) => r.txnType === 'resale' && r.sourceUnitPrice)
    .reduce((sum, r) => sum + resaleProfitPerTon(r.sourceUnitPrice!, r.unitPrice) * r.qty, 0);

  const summaryByProduct = products.map((p) => {
    const rows = ledger.filter((r) => r.product === p.name);
    const purchase = rows.reduce((s, r) => s + (r.txnType === 'purchase' ? r.qty : 0), 0);
    const loading = rows.reduce((s, r) => s + r.loading, 0);
    const last = rows[rows.length - 1];
    return {
      name: p.name,
      purchase,
      loading,
      goodsBalance: last?.goodsBalance ?? 0,
      cashBalance: last?.cashBalance ?? 0,
    };
  });

  const exportColumns = [
    { key: 'dateJalali', label: 'تاریخ شمسی' },
    { key: 'dateGregorian', label: 'تاریخ میلادی' },
    { key: 'txnType', label: 'نوع عملیات' },
    { key: 'party', label: 'طرف حساب' },
    { key: 'details', label: 'تفصیلات' },
    { key: 'product', label: 'نوع جنس' },
    { key: 'qty', label: 'تعداد' },
    { key: 'unitPrice', label: 'فیات' },
    { key: 'loading', label: 'بارگیری/استرداد' },
    { key: 'goodsBalance', label: 'بیلانس جنسی' },
    { key: 'totalPrice', label: 'جمله قیمت' },
    { key: 'receipt', label: 'رسیدات' },
    { key: 'cashBalance', label: 'بیلانس نقدی' },
    { key: 'warehouse', label: 'گدام' },
    { key: 'relatedCustomerName', label: 'مشتری مرتبط' },
    { key: 'notes', label: 'ملاحظات' },
  ];

  const exportRows = ledger.map((r) => ({
    ...r,
    txnType: customerTxnLabels[r.txnType] ?? r.txnType,
    relatedCustomerName: r.relatedCustomerName ?? '',
  }));

  return (
    <div className="min-w-0 space-y-6 animate-fade-in">
      {/* Profile header */}
      <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="relative bg-gradient-to-bl from-teal-50 via-white to-cyan-50/40 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-teal-400 to-teal-600 text-2xl font-bold text-white shadow-lg shadow-teal-200/60">
                {customer.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    {customer.name}
                  </h1>
                  <Badge variant={customer.status === 'warning' ? 'warning' : cashBalance < 0 ? 'danger' : 'success'}>
                    {customer.status === 'warning'
                      ? 'هشدار اعتبار'
                      : cashBalance < 0
                        ? 'بدهکار'
                        : 'فعال'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="num">{customer.code}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1 num">
                    <Phone className="h-3.5 w-3.5" />
                    {customer.phone}
                  </span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <CompanySwitcher />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ExportButtons
                filename={`customer-${customer.code}`}
                title={`صورت حساب ${customer.name}`}
                columns={exportColumns}
                rows={exportRows}
              />
              <Button variant="outline" size="sm">
                <Printer className="ml-2 h-4 w-4" />
                چاپ
              </Button>
              <Button size="sm">
                <Plus className="ml-2 h-4 w-4" />
                معامله جدید
              </Button>
              <Link href="/dashboard/customers">
                <Button variant="outline" size="sm">
                  <ArrowRight className="ml-2 h-4 w-4" />
                  بازگشت
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'سقف اعتبار', value: formatCurrency(customer.creditLimit), icon: BadgeCheck, tone: 'text-violet-600 bg-violet-50' },
            { label: 'بیلانس نقدی', value: formatCurrency(cashBalance), icon: Wallet, tone: 'text-sky-600 bg-sky-50', valueClass: balanceClass(cashBalance) },
            { label: 'بیلانس جنسی', value: formatNumber(goodsBalance, 0), icon: Boxes, tone: 'text-teal-600 bg-teal-50' },
            { label: 'تعداد معاملات', value: String(ledger.length), icon: Activity, tone: 'text-amber-600 bg-amber-50' },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', k.tone)}>
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                </div>
                <p className={cn('mt-3 text-xl font-extrabold num text-slate-900', k.valueClass)}>
                  {k.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {resaleRows.length > 0 ? (
        <Card className="rounded-[22px] border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 text-sm text-amber-950">
            <p className="font-bold">فروش مجدد کالای مشتری</p>
            <p className="mt-1 leading-relaxed">
              مشتری ممکن است کالا بخرد و سپس همان مقدار از حساب جنسی او استرداد و به مشتری دیگر با قیمت بالاتر فروخته شود.
            </p>
            {resaleProfit > 0 ? (
              <p className="mt-2 font-semibold num">
                سود تقریبی شرکت از فروش مجدد: {formatCurrency(resaleProfit)}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="ledger">
        <TabsList className="w-full flex-wrap justify-start gap-1 rounded-2xl bg-slate-100 p-1 sm:w-auto">
          <TabsTrigger value="ledger" className="rounded-xl">دفتر کل</TabsTrigger>
          <TabsTrigger value="goods" className="rounded-xl">خلاصه کالاها</TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl">اطلاعات کلی</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl">فعالیت اخیر</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger">
          <Card className="overflow-hidden rounded-[22px] border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.045)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-teal-600" />
                دفتر کل مشتری
              </CardTitle>
            </CardHeader>
            <div className="table-scroll-hint hidden lg:flex">
              <span>←</span>
              <span>برای دیدن همه ستون‌ها جدول را به چپ و راست بکشید</span>
              <span>→</span>
            </div>
            <CardContent className="px-0 pb-4 lg:pb-0 lg:pt-0">
              <ResponsiveData
                table={
                  <div className="table-scroll table-scroll-wide">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>تاریخ شمسی</TableHead>
                          <TableHead>تاریخ میلادی</TableHead>
                          <TableHead>نوع عملیات</TableHead>
                          <TableHead>طرف حساب</TableHead>
                          <TableHead>تفصیلات</TableHead>
                          <TableHead>نوع جنس</TableHead>
                          <TableHead>تعداد</TableHead>
                          <TableHead>فیات</TableHead>
                          <TableHead>بارگیری</TableHead>
                          <TableHead>بیلانس جنسی</TableHead>
                          <TableHead>جمله قیمت</TableHead>
                          <TableHead>رسیدات</TableHead>
                          <TableHead>بیلانس نقدی</TableHead>
                          <TableHead>گدام</TableHead>
                          <TableHead>مشتری مرتبط</TableHead>
                          <TableHead>ملاحظات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledger.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="num">{r.dateJalali}</TableCell>
                            <TableCell className="num" dir="ltr">
                              {r.dateGregorian || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={txnBadgeVariant(r.txnType)}>
                                {customerTxnLabels[r.txnType]}
                              </Badge>
                            </TableCell>
                            <TableCell>{r.party}</TableCell>
                            <TableCell className="max-w-[180px] whitespace-normal">{r.details}</TableCell>
                            <TableCell>{r.product}</TableCell>
                            <TableCell className="num">{r.qty || '-'}</TableCell>
                            <TableCell className="num">
                              {r.unitPrice ? formatCurrency(r.unitPrice) : '-'}
                            </TableCell>
                            <TableCell className="num">{r.loading || '-'}</TableCell>
                            <TableCell className="num">{formatNumber(r.goodsBalance, 0)}</TableCell>
                            <TableCell className="num">
                              {r.totalPrice ? formatCurrency(r.totalPrice) : '-'}
                            </TableCell>
                            <TableCell className="num text-emerald-700">
                              {r.receipt ? formatCurrency(r.receipt) : '-'}
                            </TableCell>
                            <TableCell className={`num font-semibold ${balanceClass(r.cashBalance)}`}>
                              {formatCurrency(r.cashBalance)}
                            </TableCell>
                            <TableCell>{r.warehouse}</TableCell>
                            <TableCell>
                              {r.relatedCustomerId ? (
                                <Link
                                  href={`/dashboard/customers/${r.relatedCustomerId}`}
                                  className="text-[var(--brand)] hover:underline"
                                >
                                  {r.relatedCustomerName}
                                </Link>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{r.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                }
                cards={
                  ledger.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">هنوز معامله‌ای ثبت نشده است</p>
                  ) : (
                    ledger.map((r) => (
                      <MobileRecordCard
                        key={r.id}
                        title={customer.name}
                        subtitle={`${r.dateJalali} · ${r.party}`}
                        badge={
                          <Badge variant={txnBadgeVariant(r.txnType)}>
                            {customerTxnLabels[r.txnType]}
                          </Badge>
                        }
                        metrics={[
                          { label: 'مبلغ', value: r.totalPrice ? formatCurrency(r.totalPrice) : '-' },
                          {
                            label: 'مقدار / جنس',
                            value: r.qty ? `${formatNumber(r.qty, 0)} ${r.product}` : r.product || '-',
                          },
                          {
                            label: 'بیلانس نقدی',
                            value: (
                              <span className={balanceClass(r.cashBalance)}>
                                {formatCurrency(r.cashBalance)}
                              </span>
                            ),
                          },
                          { label: 'بیلانس جنسی', value: formatNumber(r.goodsBalance, 0) },
                        ]}
                        extra={
                          <>
                            <ExtraRow label="تاریخ میلادی" value={r.dateGregorian || '-'} />
                            <ExtraRow label="فیات" value={r.unitPrice ? formatCurrency(r.unitPrice) : '-'} />
                            <ExtraRow label="بارگیری" value={r.loading || '-'} />
                            <ExtraRow label="رسیدات" value={r.receipt ? formatCurrency(r.receipt) : '-'} />
                            <ExtraRow label="گدام" value={r.warehouse || '-'} />
                            <ExtraRow label="مشتری مرتبط" value={r.relatedCustomerName || '-'} />
                            <ExtraRow label="تفصیلات" value={r.details || '-'} />
                            <ExtraRow label="ملاحظات" value={r.notes || '-'} />
                          </>
                        }
                      />
                    ))
                  )
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goods">
          <Card className="overflow-hidden rounded-[22px] border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">خلاصه کالاها</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-4 lg:pb-0">
              <ResponsiveData
                breakpoint="md"
                table={
                  <div className="table-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>نوع جنس</TableHead>
                          <TableHead>خرید</TableHead>
                          <TableHead>بارگیری/استرداد</TableHead>
                          <TableHead>بیلانس جنسی</TableHead>
                          <TableHead>بیلانس نقدی</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summaryByProduct
                          .filter((s) => s.purchase || s.loading || s.goodsBalance)
                          .map((s) => (
                            <TableRow key={s.name}>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell className="num">{formatNumber(s.purchase, 0)}</TableCell>
                              <TableCell className="num">{formatNumber(s.loading, 0)}</TableCell>
                              <TableCell className="num">{formatNumber(s.goodsBalance, 0)}</TableCell>
                              <TableCell className={`num ${balanceClass(s.cashBalance)}`}>
                                {formatCurrency(s.cashBalance)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                }
                cards={summaryByProduct
                  .filter((s) => s.purchase || s.loading || s.goodsBalance)
                  .map((s) => (
                    <MobileRecordCard
                      key={s.name}
                      title={s.name}
                      metrics={[
                        { label: 'خرید', value: formatNumber(s.purchase, 0) },
                        { label: 'بارگیری/استرداد', value: formatNumber(s.loading, 0) },
                        { label: 'بیلانس جنسی', value: formatNumber(s.goodsBalance, 0) },
                        {
                          label: 'بیلانس نقدی',
                          value: (
                            <span className={balanceClass(s.cashBalance)}>
                              {formatCurrency(s.cashBalance)}
                            </span>
                          ),
                        },
                      ]}
                    />
                  ))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['نام مشتری', customer.name],
              ['کد', customer.code],
              ['تلفن', customer.phone],
              ['سقف اعتبار', formatCurrency(customer.creditLimit)],
              ['آخرین معامله', customer.lastTxn],
              ['وضعیت', customer.status === 'warning' ? 'هشدار اعتبار' : 'فعال'],
            ].map(([label, value]) => (
              <Card key={String(label)} className="rounded-[20px] border-slate-100">
                <CardContent className="p-4">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-3">
            {ledger.slice(-6).reverse().map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 rounded-[20px] border border-slate-100 bg-white p-4 shadow-[0_6px_20px_rgba(15,23,42,0.04)]"
              >
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <Activity className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={txnBadgeVariant(r.txnType)}>{customerTxnLabels[r.txnType]}</Badge>
                    <span className="text-xs text-slate-400 num">{r.dateJalali}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-800">{r.details || r.party}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.product ? `${r.product} · ` : ''}
                    {r.totalPrice ? formatCurrency(r.totalPrice) : formatCurrency(r.cashBalance)}
                  </p>
                </div>
              </div>
            ))}
            {!ledger.length ? (
              <p className="py-10 text-center text-sm text-slate-500">فعالیتی ثبت نشده است</p>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
