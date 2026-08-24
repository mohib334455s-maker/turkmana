'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Download, FileText, Layers, Plus, Trash2, Truck } from 'lucide-react';
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
import { BrandDocumentHeader, CompanyLogo } from '@/components/brand/company-logo';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { ForeignArrivalRecord, GoodsArrivalRecord, PartyRecord } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ExportButtons } from '@/components/shared/export-buttons';
import { RelatedJournal } from '@/components/journal/related-journal';
import { isContractOpenForExpenses } from '@/lib/permissions';
import { downloadContractJson, exportContractDocument } from '@/lib/export';
import { contractValue, paymentProgress } from '@/lib/contract-payments';
import { notifyAdminChange } from '@/lib/activity-store';
import { todayIso } from '@/lib/purchase-flow';
import { useI18n } from '@/lib/i18n/store';

const EMPTY: OpsRow[] = [];

function partyQty(value: unknown): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object' && 'qty' in value) {
    return Number((value as { qty: number }).qty) || 0;
  }
  return Number(value) || 0;
}

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const contractId = Number(id);
  const searchParams = useSearchParams();
  const { tx } = useI18n();
  const contract = useOpsStore((s) => s.contracts.find((c) => c.id === contractId));
  const updateContract = useOpsStore((s) => s.updateContract);
  const addContractPayment = useOpsStore((s) => s.addContractPayment);
  const removeContractPayment = useOpsStore((s) => s.removeContractPayment);
  const payments = useOpsStore((s) =>
    s.contractPayments.filter((p) => p.contractId === contractId)
  );
  const [payOpen, setPayOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('pay') === '1') setPayOpen(true);
  }, [searchParams]);

  const contractParties = useOpsStore(
    (s) => ((s.lists.parties ?? EMPTY) as unknown as PartyRecord[]).filter((p) => p.contractId === contractId)
  );
  const arrivals = useOpsStore((s) =>
    ((s.lists.foreignArrivals ?? EMPTY) as unknown as ForeignArrivalRecord[]).filter(
      (a) => a.contractNumber === contract?.number
    )
  );
  const goods = useOpsStore((s) =>
    ((s.lists.goodsArrivals ?? EMPTY) as unknown as GoodsArrivalRecord[]).filter((g) => g.contractId === contractId)
  );

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

  const progress = paymentProgress(
    contractValue(contract.totalQty, contract.pricePerUnit),
    contract.paidAmount || 0
  );

  const exportPayload = {
    id: contract.id,
    number: contract.number,
    supplierName: contract.supplierName,
    product: contract.product,
    location: contract.location,
    company: contract.company,
    status: contract.status,
    totalQty: contract.totalQty,
    pricePerUnit: contract.pricePerUnit,
    arrived: contract.arrived,
    unloaded: contract.unloaded,
    sold: contract.sold,
    shortage: contract.shortage,
    waste: contract.waste,
    sellable: contract.sellable,
    transit: contract.transit,
    paidAmount: progress.paidAmount,
    contractValue: progress.contractVal,
    parties: contractParties.map((p) => ({
      number: p.number,
      location: p.location,
      qty: partyQty(p.qty),
      arrived: partyQty(p.arrived),
      unloaded: partyQty(p.unloaded),
      sold: partyQty(p.sold),
      shortage: partyQty(p.shortage),
      waste: partyQty(p.waste),
      sellable: partyQty(p.sellable),
      transit: partyQty(p.transit),
      status: String(p.status ?? ''),
    })),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <BrandDocumentHeader
        company={contract.company}
        title={`قرارداد ${contract.number}`}
        subtitle={`${contract.supplierName} — ${contract.product} — ${contract.location}`}
        actions={
          <>
            <Button
              size="sm"
              className="bg-emerald-500 text-white hover:bg-emerald-400"
              onClick={() => void exportContractDocument(exportPayload)}
            >
              <FileText className="ml-2 h-4 w-4" />
              خروجی قرارداد
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => downloadContractJson(exportPayload)}
            >
              <Download className="ml-2 h-4 w-4" />
              JSON
            </Button>
          </>
        }
      />

      <PageHeader
        title={`جزئیات قرارداد ${contract.number}`}
        description={`${contract.supplierName} — ${contract.product}`}
        hideIcon
        actions={
          <>
            <ExportButtons
              filename={`contract-${contract.number}`}
              title={`قرارداد ${contract.number}`}
              subtitle={`${contract.supplierName} — ${contract.product}`}
              company={contract.company}
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
              rows={[
                contract,
                ...contractParties.map((p) => ({
                  number: p.number,
                  supplierName: contract.supplierName,
                  product: contract.product,
                  totalQty: partyQty(p.qty),
                  arrived: partyQty(p.arrived),
                  unloaded: partyQty(p.unloaded),
                  sold: partyQty(p.sold),
                  sellable: partyQty(p.sellable),
                  transit: partyQty(p.transit),
                  location: p.location,
                })),
              ]}
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
            <Button
              variant={isContractOpenForExpenses(contract.status) ? 'outline' : 'default'}
              size="sm"
              onClick={() =>
                updateContract(contract.id, {
                  status: isContractOpenForExpenses(contract.status) ? 'inactive' : 'active',
                })
              }
            >
              {isContractOpenForExpenses(contract.status) ? 'غیرفعال کردن' : 'فعال کردن'}
            </Button>
          </>
        }
      />

      {!isContractOpenForExpenses(contract.status) ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          این قرارداد غیرفعال است — مفاد و ضرر بسته شده و ثبت مصارف جدید روی آن مجاز نیست.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['مقدار کل', `${formatNumber(contract.totalQty, 0)} تن`],
          ['قیمت واحد', formatCurrency(contract.pricePerUnit)],
          ['وضعیت', isContractOpenForExpenses(contract.status) ? 'فعال' : 'غیرفعال'],
          ['شرکت', contract.company === 'arya' ? 'آریا' : 'ترکمن'],
        ].map(([label, value]) => (
          <Card key={String(label)} className="rounded-2xl border-slate-200 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-2xl border-teal-200 shadow-none">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-teal-100 bg-teal-50/50 pb-4">
          <div>
            <CardTitle className="text-base">{tx('پرداخت قرارداد', 'Contract payments')}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">
              {tx(
                'پیش‌پرداخت ۴۰٪، پرداخت جزئی یا کامل — درصد و باقی اینجا مشخص است.',
                '40% advance, partial or full — percent and remaining shown here.'
              )}
            </p>
          </div>
          <Button size="sm" onClick={() => setPayOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            {tx('ثبت پرداخت', 'Record payment')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">{tx('ارزش قرارداد', 'Contract value')}</p>
              <p className="mt-1 text-lg font-extrabold num">{formatCurrency(progress.contractVal)}</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
              <p className="text-xs text-emerald-800">{tx('پرداخت‌شده', 'Paid')}</p>
              <p className="mt-1 text-lg font-extrabold num text-emerald-700">
                {formatCurrency(progress.paidAmount)}
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-xs text-amber-900">{tx('باقی پرداخت', 'Remaining')}</p>
              <p className="mt-1 text-lg font-extrabold num text-amber-800">
                {formatCurrency(progress.remaining)}
              </p>
            </div>
            <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3">
              <p className="text-xs text-sky-900">{tx('درصد پرداخت', 'Paid %')}</p>
              <p className="mt-1 text-lg font-extrabold num text-sky-800">{progress.percent}%</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{ width: `${Math.min(100, Math.max(0, progress.percent))}%` }}
                />
              </div>
            </div>
          </div>
          {payments.length === 0 ? (
            <p className="text-sm text-slate-500">
              {tx('هنوز پرداختی ثبت نشده.', 'No payments recorded yet.')}
            </p>
          ) : (
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tx('تاریخ', 'Date')}</TableHead>
                    <TableHead>{tx('مبلغ', 'Amount')}</TableHead>
                    <TableHead>{tx('درصد', '%')}</TableHead>
                    <TableHead>{tx('روش', 'Method')}</TableHead>
                    <TableHead>{tx('یادداشت', 'Notes')}</TableHead>
                    <TableHead className="text-end">{tx('حذف', 'Delete')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="num">{p.dateIso}</TableCell>
                      <TableCell className="num font-semibold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell className="num">{p.percent != null ? `${p.percent}%` : '—'}</TableCell>
                      <TableCell>{p.method || '—'}</TableCell>
                      <TableCell>{p.notes || '—'}</TableCell>
                      <TableCell className="text-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-rose-600"
                          onClick={() => removeContractPayment(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['باقی قرارداد', formatNumber(contract.totalQty - contract.arrived, 0)],
          ['مجموع دریافت (آمد)', formatNumber(contract.arrived, 0)],
          ['مجموع تخلیه', formatNumber(contract.unloaded, 0)],
          ['موجودی فعلی (قابل فروش)', formatNumber(contract.sellable, 0)],
        ].map(([label, value]) => (
          <Card key={String(label)} className="rounded-2xl border-slate-200 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold num">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-none">
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

      <Card className="rounded-2xl border-slate-200 shadow-none">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">پارتی‌ها به تفکیک محل</CardTitle>
            <CompanyLogo company={contract.company} size="sm" />
          </div>
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
                            <TableCell className="num">{formatNumber(partyQty(p.qty), 0)}</TableCell>
                            <TableCell className="num">{formatNumber(partyQty(p.arrived), 0)}</TableCell>
                            <TableCell className="num">{formatNumber(partyQty(p.unloaded), 0)}</TableCell>
                            <TableCell className="num">{formatNumber(partyQty(p.sold), 0)}</TableCell>
                            <TableCell className="num">{formatNumber(partyQty(p.shortage), 0)}</TableCell>
                            <TableCell className="num">{formatNumber(partyQty(p.waste), 0)}</TableCell>
                            <TableCell className="num text-emerald-700">
                              {formatNumber(partyQty(p.sellable), 0)}
                            </TableCell>
                            <TableCell className="num">{formatNumber(partyQty(p.transit), 0)}</TableCell>
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
                      { label: 'مقدار', value: formatNumber(partyQty(p.qty), 0) },
                      { label: 'قابل فروش', value: formatNumber(partyQty(p.sellable), 0) },
                      { label: 'فروش', value: formatNumber(partyQty(p.sold), 0) },
                      { label: 'ترانزیت', value: formatNumber(partyQty(p.transit), 0) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="آمد" value={formatNumber(partyQty(p.arrived), 0)} />
                        <ExtraRow label="تخلیه" value={formatNumber(partyQty(p.unloaded), 0)} />
                        <ExtraRow label="کسری" value={formatNumber(partyQty(p.shortage), 0)} />
                        <ExtraRow label="ضایعات" value={formatNumber(partyQty(p.waste), 0)} />
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
        <Card className="rounded-2xl border-slate-200 shadow-none">
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

        <Card className="rounded-2xl border-slate-200 shadow-none">
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

      <RelatedJournal filter={{ contractId: contract.id }} />

      <CompactFormDialog
        open={payOpen}
        onClose={() => setPayOpen(false)}
        title={tx('ثبت پرداخت قرارداد', 'Record contract payment')}
        size="lg"
        fields={[
          { key: 'date', label: tx('تاریخ', 'Date'), type: 'date', required: true },
          { key: 'percent', label: tx('درصد (مثلاً ۴۰)', 'Percent (e.g. 40)'), type: 'number' },
          { key: 'amount', label: tx('مبلغ', 'Amount'), type: 'number' },
          {
            key: 'method',
            label: tx('روش پرداخت', 'Method'),
            placeholder: tx('صرافی / بانک / نقد', 'Exchange / bank / cash'),
          },
          { key: 'notes', label: tx('یادداشت', 'Notes') },
        ]}
        initial={{ date: todayIso(), percent: '', amount: '', method: '' }}
        submitLabel={tx('ثبت', 'Save')}
        onSubmit={(v) => {
          addContractPayment({
            contractId: contract.id,
            dateIso: v.date || todayIso(),
            percent: v.percent ? Number(v.percent) : undefined,
            amount: v.amount ? Number(v.amount) : undefined,
            method: v.method || '',
            notes: v.notes || '',
          });
        }}
      />

      <p className="text-xs text-slate-500">
        زنجیره: Contract → Party → Shipment → Warehouse
      </p>
    </div>
  );
}
