'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowRight, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { goodsArrivals } from '@/lib/demo-data';
import {
  calculateProfitLoss,
  sumDomesticExpenses,
  sumForeignExpenses,
} from '@/lib/calculations/profit-loss';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function GoodsArrivalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const arrival = goodsArrivals.find((g) => g.id === Number(id));

  if (!arrival) {
    return (
      <div className="space-y-4">
        <p>وارده یافت نشد.</p>
        <Link href="/dashboard/goods-arrivals">
          <Button variant="outline">بازگشت</Button>
        </Link>
      </div>
    );
  }

  const foreign = sumForeignExpenses(arrival.expenses);
  const domestic = sumDomesticExpenses(arrival.expenses);
  const impact = calculateProfitLoss({
    product: arrival.contractNumber,
    purchaseQty: arrival.netWeight,
    purchaseAmount: arrival.totalPrice,
    wasteQty: Math.abs(arrival.weightDiff),
    soldQty: 0,
    salesAmount: 0,
    remainingQty: arrival.netWeight,
    marketRate: arrival.pricePerUnit * 1.1,
    expenses: arrival.expenses,
  });

  const foreignItems: [string, number][] = [
    ['ترانسپورت خارجی', arrival.expenses.transport],
    ['کمیسیون بانکی', arrival.expenses.bankCommission],
    ['راه‌آهن', arrival.expenses.railway],
    ['کرایه موتر', arrival.expenses.truckRent],
    ['ذخیره', arrival.expenses.storage],
    ['جریمه', arrival.expenses.fine],
    ['بارگیری', arrival.expenses.loading],
    ['گمرک خارجی', arrival.expenses.foreignCustoms],
    ['سایر', arrival.expenses.otherForeign],
  ];

  const domesticItems: [string, number][] = [
    ['گمرک', arrival.expenses.customs],
    ['تلکس', arrival.expenses.telex],
    ['راه‌آهن', arrival.expenses.railwayLocal],
    ['خدمات مواد نفتی', arrival.expenses.oilServices],
    ['لابراتوار', arrival.expenses.lab],
    ['جریمه توقف', arrival.expenses.demurrage],
    ['خدمات بندری', arrival.expenses.port],
    ['ترانسپورت', arrival.expenses.transportLocal],
    ['ذخیره', arrival.expenses.storageLocal],
    ['کمیسیون لیتری', arrival.expenses.literCommission],
    ['حق‌الوزن', arrival.expenses.weighing],
    ['هزینه انتقال', arrival.expenses.transfer],
    ['مصارف دولتی', arrival.expenses.government],
    ['مصارف قرارداد', arrival.expenses.contractCost],
    ['مصارف دفتر', arrival.expenses.office],
    ['سایر', arrival.expenses.otherLocal],
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`وارده جنسی ${arrival.number}`}
        description={`${arrival.dateJalali} | ${arrival.dateGregorian}`}
        actions={
          <>
            <ExportButtons
              filename={`goods-arrival-${arrival.number}`}
              title={`وارده ${arrival.number}`}
              columns={[
                { key: 'field', label: 'فیلد' },
                { key: 'value', label: 'مقدار' },
              ]}
              rows={[
                { field: 'تاریخ شمسی', value: arrival.dateJalali },
                { field: 'تاریخ میلادی', value: arrival.dateGregorian },
                { field: 'فروشنده', value: arrival.supplier },
                { field: 'قرارداد', value: arrival.contractNumber },
                { field: 'محل', value: arrival.location },
                { field: 'واگن', value: arrival.wagonNumber },
                { field: 'CMR Weight', value: arrival.cmrWeight },
                { field: 'Net Weight', value: arrival.netWeight },
                { field: 'اختلاف وزن', value: arrival.weightDiff },
                { field: 'قیمت/تن', value: arrival.pricePerUnit },
                { field: 'Total Price', value: arrival.totalPrice },
                { field: 'Balance', value: arrival.balance },
                { field: 'مصارف خارجی', value: foreign },
                { field: 'مصارف داخلی', value: domestic },
                ...foreignItems.map(([field, value]) => ({ field: `خارجی - ${field}`, value })),
                ...domesticItems.map(([field, value]) => ({ field: `داخلی - ${field}`, value })),
              ]}
            />
            <Link href="/dashboard/goods-arrivals">
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
          ['فروشنده', arrival.supplier],
          ['قرارداد', arrival.contractNumber],
          ['محل / گدام', `${arrival.location} / ${arrival.warehouse}`],
          ['شرکت', arrival.company === 'arya' ? 'آریا' : 'ترکمن'],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">اطلاعات وزن و قیمت</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['شماره واگن', arrival.wagonNumber],
              ['شماره CMR', arrival.cmrNumber],
              ['CMR Weight', formatNumber(arrival.cmrWeight, 2)],
              ['Net Weight', formatNumber(arrival.netWeight, 2)],
              ['اختلاف وزن', formatNumber(arrival.weightDiff, 2)],
              ['قیمت هر تن', formatCurrency(arrival.pricePerUnit)],
              ['Total Price', formatCurrency(arrival.totalPrice)],
              ['Balance', formatCurrency(arrival.balance)],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 font-semibold num">{value}</p>
              </div>
            ))}
          </div>
          {arrival.notes ? (
            <p className="mt-4 text-sm text-slate-600">توضیحات: {arrival.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">هزینه‌های مرتبط با واردات</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['حمل / ترانسپورت', arrival.expenses.transport + arrival.expenses.transportLocal],
            ['گمرک', arrival.expenses.customs + arrival.expenses.foreignCustoms],
            ['خدمات', arrival.expenses.oilServices + arrival.expenses.port + arrival.expenses.lab],
            ['کمیسیون‌ها', arrival.expenses.bankCommission + arrival.expenses.literCommission],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 font-bold num">{formatCurrency(Number(value))}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              مصارف خارجی (نمونه ساختار ۲){' '}
              <Badge variant="muted" className="mr-2">
                {formatCurrency(foreign)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foreignItems.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-50 py-1.5 text-sm"
              >
                <span className="text-slate-600">{label}</span>
                <span className="num font-medium">{formatCurrency(value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              مصارف داخلی{' '}
              <Badge variant="muted" className="mr-2">
                {formatCurrency(domestic)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {domesticItems.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-slate-50 py-1.5 text-sm"
              >
                <span className="text-slate-600">{label}</span>
                <span className="num font-medium">{formatCurrency(value)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200 bg-emerald-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            اثر خودکار روی سیستم (نمایش فاز ۱)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={`/dashboard/contracts/${arrival.contractId}`}
            className="rounded-lg bg-white border px-3 py-2 hover:shadow-sm"
          >
            <p className="text-xs text-slate-500">قرارداد</p>
            <p className="font-semibold num">{arrival.contractNumber}</p>
          </Link>
          <Link
            href={`/dashboard/suppliers/${arrival.supplierId}`}
            className="rounded-lg bg-white border px-3 py-2 hover:shadow-sm"
          >
            <p className="text-xs text-slate-500">حساب فروشنده</p>
            <p className="font-semibold">{arrival.supplier}</p>
          </Link>
          <Link
            href={`/dashboard/warehouses/${arrival.warehouseId}`}
            className="rounded-lg bg-white border px-3 py-2 hover:shadow-sm"
          >
            <p className="text-xs text-slate-500">موجودی گدام</p>
            <p className="font-semibold">{arrival.warehouse}</p>
          </Link>
          <Link
            href="/dashboard/profit-loss"
            className="rounded-lg bg-white border px-3 py-2 hover:shadow-sm"
          >
            <p className="text-xs text-slate-500">بهای تمام‌شده / تن</p>
            <p className="font-semibold num">
              {formatCurrency(impact.costPerTon)}
            </p>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
