'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Activity,
  Boxes,
  FileText,
  Globe2,
  Phone,
  Plus,
  Printer,
  Wallet,
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
import { supplierLedgers, suppliers } from '@/lib/demo-data';
import { balanceClass, cn, formatCurrency, formatNumber } from '@/lib/utils';

export default function SupplierLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supplierId = Number(id);
  const supplier = suppliers.find((s) => s.id === supplierId);
  const ledger = supplierLedgers[supplierId] ?? [];

  if (!supplier) {
    return (
      <div className="space-y-4">
        <p>تأمین‌کننده یافت نشد.</p>
        <Link href="/dashboard/suppliers">
          <Button variant="outline">بازگشت</Button>
        </Link>
      </div>
    );
  }

  const summaryMap = new Map<
    string,
    {
      location: string;
      contract: string;
      product: string;
      purchase: number;
      loading: number;
      goodsBalance: number;
      cashBalance: number;
    }
  >();

  ledger.forEach((r) => {
    if (r.product === '-') return;
    const key = `${r.location}|${r.contract}|${r.product}`;
    const prev = summaryMap.get(key);
    summaryMap.set(key, {
      location: r.location,
      contract: r.contract,
      product: r.product,
      purchase: (prev?.purchase ?? 0) + r.qty,
      loading: (prev?.loading ?? 0) + r.loading,
      goodsBalance: r.goodsBalance,
      cashBalance: r.cashBalance,
    });
  });

  const summaries = [...summaryMap.values()];

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="relative bg-gradient-to-bl from-orange-50 via-white to-amber-50/40 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-orange-400 to-amber-600 text-2xl font-bold text-white shadow-lg shadow-orange-200/60">
                {supplier.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    {supplier.name}
                  </h1>
                  <Badge variant={supplier.cashBalance < 0 ? 'danger' : 'success'}>
                    {supplier.cashBalance < 0 ? 'بدهکار هستیم' : 'بستانکار / فعال'}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  <span className="num">{supplier.code}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Globe2 className="h-3.5 w-3.5" />
                    {supplier.country}
                  </span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1 num">
                    <Phone className="h-3.5 w-3.5" />
                    {supplier.phone || '—'}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ExportButtons
                filename={`supplier-${supplier.code}`}
                title={`حساب ${supplier.name}`}
                columns={[
                  { key: 'number', label: 'شماره' },
                  { key: 'dateJalali', label: 'تاریخ شمسی' },
                  { key: 'dateGregorian', label: 'تاریخ میلادی' },
                  { key: 'party', label: 'طرف حساب' },
                  { key: 'details', label: 'تفصیلات' },
                  { key: 'contract', label: 'قرارداد' },
                  { key: 'product', label: 'نوع جنس' },
                  { key: 'location', label: 'محل' },
                  { key: 'qty', label: 'تعداد/تن' },
                  { key: 'unitPrice', label: 'فیات' },
                  { key: 'loading', label: 'بارگیری' },
                  { key: 'goodsBalance', label: 'بیلانس جنسی' },
                  { key: 'totalPrice', label: 'جمله قیمت' },
                  { key: 'payment', label: 'پرداختی' },
                  { key: 'deposit', label: 'بیعانه' },
                  { key: 'cashBalance', label: 'بیلانس نقدی' },
                  { key: 'driver', label: 'درایور' },
                  { key: 'plate', label: 'پلیت' },
                  { key: 'notes', label: 'ملاحظات' },
                ]}
                rows={ledger.map((r) => ({
                  ...r,
                  payment: r.payment ?? r.receipt ?? 0,
                }))}
              />
              <Button variant="outline" size="sm">
                <Printer className="ml-2 h-4 w-4" />
                چاپ
              </Button>
              <Button size="sm">
                <Plus className="ml-2 h-4 w-4" />
                ثبت خرید
              </Button>
              <Link href="/dashboard/suppliers">
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
            {
              label: 'بیلانس نقدی',
              value: formatCurrency(supplier.cashBalance),
              icon: Wallet,
              tone: 'text-sky-600 bg-sky-50',
              valueClass: balanceClass(supplier.cashBalance),
            },
            {
              label: 'آخرین معامله',
              value: supplier.lastTxn,
              icon: Activity,
              tone: 'text-amber-600 bg-amber-50',
            },
            {
              label: 'تعداد اسناد',
              value: String(ledger.length),
              icon: FileText,
              tone: 'text-violet-600 bg-violet-50',
            },
            {
              label: 'خطوط خلاصه',
              value: String(summaries.length),
              icon: Boxes,
              tone: 'text-teal-600 bg-teal-50',
            },
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

      <Tabs defaultValue="ledger">
        <TabsList className="w-full flex-wrap justify-start gap-1 rounded-2xl bg-slate-100 p-1 sm:w-auto">
          <TabsTrigger value="ledger" className="rounded-xl">دفتر حساب</TabsTrigger>
          <TabsTrigger value="summary" className="rounded-xl">خلاصه کالا / محل</TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl">اطلاعات کلی</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl">فعالیت اخیر</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger">
          <Card className="overflow-hidden rounded-[22px] border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.045)]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-orange-600" />
                دفتر حساب تأمین‌کننده خارجی
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
                          <TableHead>شماره</TableHead>
                          <TableHead>تاریخ شمسی</TableHead>
                          <TableHead>تاریخ میلادی</TableHead>
                          <TableHead>طرف حساب</TableHead>
                          <TableHead>تفصیلات</TableHead>
                          <TableHead>شماره قرارداد</TableHead>
                          <TableHead>نوع جنس</TableHead>
                          <TableHead>محل</TableHead>
                          <TableHead>تعداد/تن</TableHead>
                          <TableHead>فیات</TableHead>
                          <TableHead>بارگیری</TableHead>
                          <TableHead>بیلانس جنسی</TableHead>
                          <TableHead>جمله قیمت</TableHead>
                          <TableHead>پرداختی</TableHead>
                          <TableHead>بیعانه / ودیعه</TableHead>
                          <TableHead>بیلانس نقدی</TableHead>
                          <TableHead>درایور</TableHead>
                          <TableHead>پلیت</TableHead>
                          <TableHead>ملاحظات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledger.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-semibold num">{r.number || '-'}</TableCell>
                            <TableCell className="num">{r.dateJalali}</TableCell>
                            <TableCell className="num" dir="ltr">
                              {r.dateGregorian || '-'}
                            </TableCell>
                            <TableCell>{r.party}</TableCell>
                            <TableCell className="max-w-[140px] whitespace-normal">{r.details}</TableCell>
                            <TableCell>
                              <Link
                                href="/dashboard/contracts/1"
                                className="num text-[var(--brand)] hover:underline"
                              >
                                {r.contract}
                              </Link>
                            </TableCell>
                            <TableCell>{r.product}</TableCell>
                            <TableCell>{r.location}</TableCell>
                            <TableCell className="num">{r.qty || '-'}</TableCell>
                            <TableCell className="num">
                              {r.unitPrice ? formatCurrency(r.unitPrice) : '-'}
                            </TableCell>
                            <TableCell className="num">{r.loading || '-'}</TableCell>
                            <TableCell className="num">{formatNumber(r.goodsBalance, 0)}</TableCell>
                            <TableCell className="num">
                              {r.totalPrice ? formatCurrency(r.totalPrice) : '-'}
                            </TableCell>
                            <TableCell className="num text-red-600">
                              {(r.payment ?? r.receipt)
                                ? formatCurrency(r.payment ?? r.receipt)
                                : '-'}
                            </TableCell>
                            <TableCell className="num">
                              {r.deposit ? formatCurrency(r.deposit) : '-'}
                            </TableCell>
                            <TableCell className={`num font-semibold ${balanceClass(r.cashBalance)}`}>
                              {formatCurrency(r.cashBalance)}
                            </TableCell>
                            <TableCell>{r.driver || '-'}</TableCell>
                            <TableCell className="num">{r.plate || '-'}</TableCell>
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
                        title={r.details || r.party}
                        subtitle={`${r.number || '—'} · ${r.dateJalali} · ${r.contract}`}
                        badge={<Badge variant="muted">{r.product}</Badge>}
                        metrics={[
                          { label: 'مبلغ', value: r.totalPrice ? formatCurrency(r.totalPrice) : '-' },
                          { label: 'مقدار', value: r.qty || '-' },
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
                            <ExtraRow label="شماره" value={r.number || '-'} />
                            <ExtraRow label="طرف حساب" value={r.party} />
                            <ExtraRow label="تفصیلات" value={r.details || '-'} />
                            <ExtraRow label="محل" value={r.location} />
                            <ExtraRow label="فیات" value={r.unitPrice ? formatCurrency(r.unitPrice) : '-'} />
                            <ExtraRow label="بارگیری" value={r.loading || '-'} />
                            <ExtraRow
                              label="پرداختی"
                              value={
                                (r.payment ?? r.receipt)
                                  ? formatCurrency(r.payment ?? r.receipt)
                                  : '-'
                              }
                            />
                            <ExtraRow
                              label="بیعانه"
                              value={r.deposit ? formatCurrency(r.deposit) : '-'}
                            />
                            <ExtraRow label="درایور" value={r.driver || '-'} />
                            <ExtraRow label="پلیت" value={r.plate || '-'} />
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

        <TabsContent value="summary">
          <Card className="overflow-hidden rounded-[22px] border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">خلاصه به تفکیک محل و کالا</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-4 lg:pb-0">
              <ResponsiveData
                breakpoint="md"
                table={
                  <div className="table-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>محل</TableHead>
                          <TableHead>قرارداد</TableHead>
                          <TableHead>نوع جنس</TableHead>
                          <TableHead>خرید</TableHead>
                          <TableHead>بارگیری</TableHead>
                          <TableHead>بیلانس جنسی</TableHead>
                          <TableHead>بیلانس نقدی</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summaries.map((s) => (
                          <TableRow key={`${s.location}-${s.contract}-${s.product}`}>
                            <TableCell>{s.location}</TableCell>
                            <TableCell className="num">{s.contract}</TableCell>
                            <TableCell>{s.product}</TableCell>
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
                cards={summaries.map((s) => (
                  <MobileRecordCard
                    key={`${s.location}-${s.contract}-${s.product}`}
                    title={s.product}
                    subtitle={`${s.location} · ${s.contract}`}
                    metrics={[
                      { label: 'خرید', value: formatNumber(s.purchase, 0) },
                      { label: 'بارگیری', value: formatNumber(s.loading, 0) },
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
              ['نام تأمین‌کننده', supplier.name],
              ['کد', supplier.code],
              ['کشور', supplier.country],
              ['تلفن', supplier.phone || '—'],
              ['آخرین معامله', supplier.lastTxn],
              ['وضعیت', supplier.cashBalance < 0 ? 'بدهکار هستیم' : 'بستانکار'],
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
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Activity className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="muted">{r.product || 'سند'}</Badge>
                    <span className="text-xs text-slate-400 num">{r.dateJalali}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-800">{r.details || r.party}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {r.contract ? `قرارداد ${r.contract} · ` : ''}
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
