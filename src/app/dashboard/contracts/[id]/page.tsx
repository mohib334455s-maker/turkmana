'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowRight, Layers, Truck } from 'lucide-react';
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
import { PageHeader } from '@/components/shared/page-header';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { contracts, foreignArrivals, goodsArrivals, parties } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ExportButtons } from '@/components/shared/export-buttons';

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contractId = Number(id);
  const contract = contracts.find((c) => c.id === contractId);
  const contractParties = parties.filter((p) => p.contractId === contractId);
  const arrivals = foreignArrivals.filter(
    (a) => a.contractNumber === contract?.number
  );
  const goods = goodsArrivals.filter((g) => g.contractId === contractId);

  if (!contract) {
    return (
      <div className="space-y-4">
        <p>قرارداد یافت نشد.</p>
        <Link href="/dashboard/contracts">
          <Button variant="outline">بازگشت</Button>
        </Link>
      </div>
    );
  }

  const byLocation = contractParties.reduce<
    Record<string, typeof contractParties>
  >((acc, p) => {
    acc[p.location] = acc[p.location] ?? [];
    acc[p.location].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`قرارداد ${contract.number}`}
        description={`${contract.supplierName} — ${contract.product} — ${contract.location}`}
        actions={
          <>
            <ExportButtons
              filename={`contract-${contract.number}`}
              title={`قرارداد ${contract.number}`}
              columns={[
                { key: 'number', label: 'شماره' },
                { key: 'supplierName', label: 'طرف قرارداد' },
                { key: 'product', label: 'کالا' },
                { key: 'totalQty', label: 'مقدار کل' },
                { key: 'arrived', label: 'آمد' },
                { key: 'unloaded', label: 'تخلیه' },
                { key: 'sold', label: 'فروش' },
                { key: 'sellable', label: 'قابل فروش' },
                { key: 'transit', label: 'ترانزیت' },
                { key: 'location', label: 'محل' },
              ]}
              rows={[contract, ...contractParties.map((p) => ({
                number: p.number,
                supplierName: contract.supplierName,
                product: contract.product,
                totalQty: p.qty,
                arrived: p.arrived,
                unloaded: p.unloaded,
                sold: p.sold,
                sellable: p.sellable,
                transit: p.transit,
                location: p.location,
              }))]}
            />
            <Link href={`/dashboard/contracts/${contract.id}/parties`}>
              <Button>
                <Layers className="ml-2 h-4 w-4" />
                پارتی‌ها
              </Button>
            </Link>
            <Link href="/dashboard/contracts">
              <Button variant="outline" size="sm">
                <ArrowRight className="ml-2 h-4 w-4" />
                بازگشت
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['مقدار کل', `${formatNumber(contract.totalQty, 0)} تن`],
          ['قیمت واحد', formatCurrency(contract.pricePerUnit)],
          ['وضعیت', contract.status === 'active' ? 'فعال' : contract.status],
          ['شرکت', contract.company === 'arya' ? 'آریا' : 'ترکمن'],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['باقی قرارداد', formatNumber(contract.totalQty - contract.arrived, 0)],
          ['مجموع دریافت (آمد)', formatNumber(contract.arrived, 0)],
          ['مجموع تخلیه', formatNumber(contract.unloaded, 0)],
          ['موجودی فعلی (قابل فروش)', formatNumber(contract.sellable, 0)],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold num">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">وضعیت اجرا</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-7">
            {[
              ['آمد', contract.arrived],
              ['تخلیه', contract.unloaded],
              ['فروش', contract.sold],
              ['کسری', contract.shortage],
              ['ضایعات', contract.waste],
              ['قابل فروش', contract.sellable],
              ['ترانزیت', contract.transit],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 font-bold num">{formatNumber(Number(value), 0)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">پارتی‌ها به تفکیک محل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(byLocation).map(([location, list]) => (
            <div key={location}>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="info">{location}</Badge>
                <span className="text-xs text-slate-500">
                  {list.length} پارتی
                </span>
              </div>
              <ResponsiveData
                table={
                  <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره پارتی</TableHead>
                    <TableHead>واگن</TableHead>
                    <TableHead>مقدار</TableHead>
                    <TableHead>آمد</TableHead>
                    <TableHead>تخلیه</TableHead>
                    <TableHead>فروش</TableHead>
                    <TableHead>کسری</TableHead>
                    <TableHead>ضایعات</TableHead>
                    <TableHead>قابل فروش</TableHead>
                    <TableHead>ترانزیت</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium num">{p.number}</TableCell>
                      <TableCell className="num">{p.wagons}</TableCell>
                      <TableCell className="num">{formatNumber(p.qty, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.arrived, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.unloaded, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.sold, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.shortage, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(p.waste, 0)}</TableCell>
                      <TableCell className="num text-emerald-700">
                        {formatNumber(p.sellable, 0)}
                      </TableCell>
                      <TableCell className="num">{formatNumber(p.transit, 0)}</TableCell>
                      <TableCell>
                        <Badge variant="muted">{p.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                  </div>
                }
                cards={list.map((p) => (
                  <MobileRecordCard
                    key={p.id}
                    title={p.number}
                    subtitle={`${p.wagons} واگن`}
                    badge={<Badge variant="muted">{p.status}</Badge>}
                    metrics={[
                      { label: 'مقدار', value: formatNumber(p.qty, 0) },
                      { label: 'قابل فروش', value: formatNumber(p.sellable, 0) },
                      { label: 'فروش', value: formatNumber(p.sold, 0) },
                      { label: 'ترانزیت', value: formatNumber(p.transit, 0) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="آمد" value={formatNumber(p.arrived, 0)} />
                        <ExtraRow label="تخلیه" value={formatNumber(p.unloaded, 0)} />
                        <ExtraRow label="کسری" value={formatNumber(p.shortage, 0)} />
                        <ExtraRow label="ضایعات" value={formatNumber(p.waste, 0)} />
                      </>
                    }
                  />
                ))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4" />
              وارده‌های خارجی مرتبط
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {arrivals.map((a) => (
              <Link
                key={a.id}
                href="/dashboard/foreign-arrivals"
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <span className="font-medium num">{a.number}</span>
                <span className="text-slate-500">
                  {formatNumber(a.seymirWeight, 0)} تن — کسری{' '}
                  {formatNumber(a.shortage, 0)}
                </span>
              </Link>
            ))}
            {!arrivals.length ? (
              <p className="text-sm text-slate-500">وارده‌ای ثبت نشده</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">وارده جنسی مرتبط</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {goods.map((g) => (
              <Link
                key={g.id}
                href={`/dashboard/goods-arrivals/${g.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <span className="font-medium num">{g.number}</span>
                <span className="text-slate-500">
                  {g.wagonNumber} — {formatCurrency(g.totalPrice)}
                </span>
              </Link>
            ))}
            {!goods.length ? (
              <p className="text-sm text-slate-500">وارده‌ای ثبت نشده</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-slate-500">
        زنجیره: Contract → Party → Shipment → Warehouse
      </p>
    </div>
  );
}
