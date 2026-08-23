'use client';

import { use, useMemo } from 'react';
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
import { TableEmpty } from '@/components/shared/table-empty';
import { BrandDocumentHeader, CompanyLogo } from '@/components/brand/company-logo';
import { useCompanyStore } from '@/lib/company-store';
import { PurchaseStatusBadge } from '@/components/purchases/purchase-status-badge';
import { useOpsStore } from '@/lib/ops-store';
import { useProductCatalog } from '@/lib/product-catalog';
import { supplierGoodsStats, supplierGoodsValue } from '@/lib/supplier-goods';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, cn, formatCurrency, formatNumber } from '@/lib/utils';
import { RelatedJournal } from '@/components/journal/related-journal';

export default function SupplierLedgerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supplierId = Number(id);
  const { t } = useI18n();
  const { company } = useCompanyStore();
  const catalog = useProductCatalog();
  const supplier = useOpsStore((store) => store.suppliers.find((row) => row.id === supplierId));
  const orders = useOpsStore((s) => s.purchaseOrders.filter((o) => o.supplierId === supplierId));
  const purchases = useOpsStore((s) => s.companyPurchases.filter((p) => p.supplierId === supplierId));
  const invoices = useOpsStore((s) => s.purchaseInvoices.filter((i) => i.supplierId === supplierId));

  const goods = useMemo(
    () => supplierGoodsStats(supplierId, catalog, purchases, invoices),
    [supplierId, catalog, purchases, invoices]
  );

  const payments = useMemo(
    () =>
      invoices
        .filter((i) => i.paid > 0)
        .map((i) => ({
          id: i.id,
          date: i.date,
          invoice: i.code || i.poCode,
          amount: i.paid,
          currency: i.currency,
          status: i.status,
        })),
    [invoices]
  );

  const ledger = useMemo(() => {
    const rows: Array<{
      id: string;
      date: string;
      type: string;
      ref: string;
      product: string;
      qty: number;
      amount: number;
      paid: number;
      status: string;
    }> = [];
    for (const o of orders) {
      rows.push({
        id: `po-${o.id}`,
        date: o.date,
        type: t('tabOrders'),
        ref: o.code,
        product: o.product,
        qty: o.qty,
        amount: o.amount,
        paid: 0,
        status: o.status,
      });
    }
    for (const p of purchases) {
      rows.push({
        id: `cp-${p.id}`,
        date: p.date,
        type: t('tabPurchases'),
        ref: p.number,
        product: p.product,
        qty: p.qty,
        amount: p.amount,
        paid: p.paid,
        status: p.status,
      });
    }
    for (const i of invoices) {
      rows.push({
        id: `inv-${i.id}`,
        date: i.date,
        type: t('tabInvoices'),
        ref: i.code || i.poCode,
        product: i.product,
        qty: i.qty,
        amount: i.amount,
        paid: i.paid,
        status: i.status,
      });
    }
    return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [orders, purchases, invoices, t]);

  if (!supplier) {
    return (
      <div className="space-y-4">
        <p>{t('supplierNotFound')}</p>
        <Link href="/dashboard/suppliers">
          <Button variant="outline">{t('back')}</Button>
        </Link>
      </div>
    );
  }

  const goodsValue = supplierGoodsValue(supplierId, purchases);

  return (
    <div className="space-y-6 animate-fade-in">
      <BrandDocumentHeader
        company={company}
        title={supplier.name}
        subtitle={`${supplier.code} · ${supplier.country}`}
      />

      <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
        <div className="relative bg-gradient-to-bl from-orange-50 via-white to-amber-50/40 px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <CompanyLogo company={company} size="lg" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                    {supplier.name}
                  </h1>
                  <Badge variant={supplier.cashBalance < 0 ? 'danger' : 'success'}>
                    {supplier.cashBalance < 0 ? t('weOwe') : t('theyOwe')}
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
                title={supplier.name}
                columns={[
                  { key: 'name', label: t('colProduct') },
                  { key: 'qty', label: t('colQty') },
                  { key: 'unit', label: t('colUnit') },
                  { key: 'amount', label: t('purchaseValue') },
                  { key: 'paid', label: t('colPaid') },
                  { key: 'txnCount', label: t('txnCount') },
                ]}
                rows={goods}
              />
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="ms-2 h-4 w-4" />
                {t('print')}
              </Button>
              <Link href="/dashboard/purchases?new=1">
                <Button size="sm">
                  <Plus className="ms-2 h-4 w-4" />
                  {t('newPurchaseOrder')}
                </Button>
              </Link>
              <Link href="/dashboard/suppliers">
                <Button variant="outline" size="sm">
                  <ArrowRight className="ms-2 h-4 w-4" />
                  {t('back')}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: t('colCashBalance'),
              value: formatCurrency(supplier.cashBalance),
              icon: Wallet,
              tone: 'text-sky-600 bg-sky-50',
              valueClass: balanceClass(supplier.cashBalance),
            },
            {
              label: t('colGoodsBalance'),
              value: formatCurrency(goodsValue),
              icon: Boxes,
              tone: 'text-teal-600 bg-teal-50',
            },
            {
              label: t('colLastTxn'),
              value: supplier.lastTxn,
              icon: Activity,
              tone: 'text-amber-600 bg-amber-50',
            },
            {
              label: t('txnCount'),
              value: String(ledger.length),
              icon: FileText,
              tone: 'text-violet-600 bg-violet-50',
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

      <Tabs defaultValue="goods">
        <TabsList className="w-full flex-wrap justify-start gap-1 rounded-2xl bg-slate-100 p-1 sm:w-auto">
          <TabsTrigger value="goods" className="rounded-xl">{t('tabGoods')}</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-xl">{t('tabOrders')}</TabsTrigger>
          <TabsTrigger value="purchases" className="rounded-xl">{t('tabPurchases')}</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-xl">{t('tabInvoices')}</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-xl">{t('tabPayments')}</TabsTrigger>
          <TabsTrigger value="ledger" className="rounded-xl">{t('tabLedger')}</TabsTrigger>
          <TabsTrigger value="info" className="rounded-xl">{t('tabInfo')}</TabsTrigger>
        </TabsList>

        <TabsContent value="goods">
          <Card className="overflow-hidden rounded-[22px] border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('goodsBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-4 lg:pb-0">
              <ResponsiveData
                table={
                  <div className="table-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('colProduct')}</TableHead>
                          <TableHead>{t('colQty')}</TableHead>
                          <TableHead>{t('colUnit')}</TableHead>
                          <TableHead>{t('purchaseValue')}</TableHead>
                          <TableHead>{t('colPaid')}</TableHead>
                          <TableHead>{t('remaining')}</TableHead>
                          <TableHead>{t('lastPurchase')}</TableHead>
                          <TableHead>{t('txnCount')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goods.length === 0 ? (
                          <TableEmpty colSpan={8} message={t('noRowsYet')} />
                        ) : null}
                        {goods.map((g) => (
                          <TableRow key={g.code}>
                            <TableCell className="font-medium">{g.name}</TableCell>
                            <TableCell className="num">{formatNumber(g.qty, 0)}</TableCell>
                            <TableCell>{g.unit}</TableCell>
                            <TableCell className="num">{formatCurrency(g.amount)}</TableCell>
                            <TableCell className="num text-emerald-700">{formatCurrency(g.paid)}</TableCell>
                            <TableCell className="num text-amber-700">
                              {formatCurrency(Math.max(0, g.amount - g.paid))}
                            </TableCell>
                            <TableCell className="num">{g.lastDate}</TableCell>
                            <TableCell className="num">{g.txnCount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                }
                cards={goods.map((g) => (
                  <MobileRecordCard
                    key={g.code}
                    title={g.name}
                    subtitle={g.code}
                    metrics={[
                      { label: t('colQty'), value: `${formatNumber(g.qty, 0)} ${g.unit}` },
                      { label: t('purchaseValue'), value: formatCurrency(g.amount) },
                      { label: t('colPaid'), value: formatCurrency(g.paid) },
                      { label: t('txnCount'), value: String(g.txnCount) },
                    ]}
                  />
                ))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <HistoryTable
            empty={t('noPurchaseOrders')}
            rows={orders.map((o) => ({
              id: o.id,
              code: o.code,
              date: o.date,
              product: o.product,
              qty: `${formatNumber(o.qty, 0)} ${o.unit}`,
              amount: formatCurrency(o.amount, o.currency),
              status: o.status,
              href: '/dashboard/purchases',
            }))}
          />
        </TabsContent>

        <TabsContent value="purchases">
          <HistoryTable
            empty={t('noCompanyPurchases')}
            rows={purchases.map((p) => ({
              id: p.id,
              code: p.number,
              date: p.date,
              product: p.product,
              qty: `${formatNumber(p.qty, 0)} ${p.unit}`,
              amount: formatCurrency(p.amount, p.currency),
              status: p.status,
              href: '/dashboard/purchases/company',
            }))}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <HistoryTable
            empty={t('noPurchaseInvoices')}
            rows={invoices.map((i) => ({
              id: i.id,
              code: i.code || i.poCode,
              date: i.date,
              product: i.product,
              qty: formatNumber(i.qty, 0),
              amount: formatCurrency(i.amount, i.currency),
              status: i.status,
              href: '/dashboard/purchases/invoices',
            }))}
          />
        </TabsContent>

        <TabsContent value="payments">
          <Card className="overflow-hidden rounded-[22px] border-slate-100">
            <CardContent className="px-0 pb-4 pt-4 lg:pb-0">
              <ResponsiveData
                table={
                  <div className="table-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('colDate')}</TableHead>
                          <TableHead>{t('colInvoice')}</TableHead>
                          <TableHead>{t('colPaid')}</TableHead>
                          <TableHead>{t('colStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableEmpty colSpan={4} message={t('noRowsYet')} />
                        ) : null}
                        {payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="num">{p.date}</TableCell>
                            <TableCell className="num">{p.invoice}</TableCell>
                            <TableCell className="num text-emerald-700">
                              {formatCurrency(p.amount, p.currency)}
                            </TableCell>
                            <TableCell>
                              <PurchaseStatusBadge status={p.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                }
                cards={payments.map((p) => (
                  <MobileRecordCard
                    key={p.id}
                    title={p.invoice}
                    subtitle={p.date}
                    badge={<PurchaseStatusBadge status={p.status} />}
                    metrics={[{ label: t('colPaid'), value: formatCurrency(p.amount, p.currency) }]}
                  />
                ))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger">
          <Card className="overflow-hidden rounded-[22px] border-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('tabLedger')}</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-4 lg:pb-0">
              <ResponsiveData
                table={
                  <div className="table-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('colDate')}</TableHead>
                          <TableHead>{t('colType')}</TableHead>
                          <TableHead>{t('code')}</TableHead>
                          <TableHead>{t('colProduct')}</TableHead>
                          <TableHead>{t('colQty')}</TableHead>
                          <TableHead>{t('colAmount')}</TableHead>
                          <TableHead>{t('colPaid')}</TableHead>
                          <TableHead>{t('colStatus')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledger.length === 0 ? (
                          <TableEmpty colSpan={8} message={t('noRowsYet')} />
                        ) : null}
                        {ledger.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="num">{r.date}</TableCell>
                            <TableCell>{r.type}</TableCell>
                            <TableCell className="num">{r.ref}</TableCell>
                            <TableCell>{r.product}</TableCell>
                            <TableCell className="num">{r.qty || '—'}</TableCell>
                            <TableCell className="num">{formatCurrency(r.amount)}</TableCell>
                            <TableCell className="num text-emerald-700">
                              {r.paid ? formatCurrency(r.paid) : '—'}
                            </TableCell>
                            <TableCell>
                              <PurchaseStatusBadge status={r.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                }
                cards={ledger.map((r) => (
                  <MobileRecordCard
                    key={r.id}
                    title={r.ref}
                    subtitle={`${r.type} · ${r.date}`}
                    badge={<PurchaseStatusBadge status={r.status} />}
                    metrics={[
                      { label: t('colProduct'), value: r.product },
                      { label: t('colAmount'), value: formatCurrency(r.amount) },
                    ]}
                    extra={<ExtraRow label={t('colPaid')} value={r.paid ? formatCurrency(r.paid) : '—'} />}
                  />
                ))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [t('name'), supplier.name],
              [t('code'), supplier.code],
              [t('colCountry'), supplier.country],
              [t('phone'), supplier.phone || '—'],
              [t('colLastTxn'), supplier.lastTxn],
              [t('accountStatus'), supplier.cashBalance < 0 ? t('weOwe') : t('theyOwe')],
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
      </Tabs>
      <RelatedJournal filter={{ supplierId }} />
    </div>
  );
}

function HistoryTable({
  empty,
  rows,
}: {
  empty: string;
  rows: Array<{
    id: number;
    code: string;
    date: string;
    product: string;
    qty: string;
    amount: string;
    status: string;
    href: string;
  }>;
}) {
  const { t } = useI18n();
  return (
    <Card className="overflow-hidden rounded-[22px] border-slate-100">
      <CardContent className="px-0 pb-4 pt-4 lg:pb-0">
        <ResponsiveData
          table={
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('code')}</TableHead>
                    <TableHead>{t('colDate')}</TableHead>
                    <TableHead>{t('colProduct')}</TableHead>
                    <TableHead>{t('colQty')}</TableHead>
                    <TableHead>{t('colAmount')}</TableHead>
                    <TableHead>{t('colStatus')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? <TableEmpty colSpan={6} message={empty} /> : null}
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Link href={r.href} className="num font-semibold text-[var(--brand)] hover:underline">
                          {r.code}
                        </Link>
                      </TableCell>
                      <TableCell className="num">{r.date}</TableCell>
                      <TableCell>{r.product}</TableCell>
                      <TableCell className="num">{r.qty}</TableCell>
                      <TableCell className="num">{r.amount}</TableCell>
                      <TableCell>
                        <PurchaseStatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          }
          cards={
            rows.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">{empty}</p>
            ) : (
              rows.map((r) => (
                <MobileRecordCard
                  key={r.id}
                  title={r.code}
                  subtitle={`${r.product} · ${r.date}`}
                  badge={<PurchaseStatusBadge status={r.status} />}
                  metrics={[
                    { label: t('colQty'), value: r.qty },
                    { label: t('colAmount'), value: r.amount },
                  ]}
                />
              ))
            )
          }
        />
      </CardContent>
    </Card>
  );
}
