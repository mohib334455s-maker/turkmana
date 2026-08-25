'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Boxes, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/shared/page-header';
import { useOpsStore } from '@/lib/ops-store';
import { cashNet } from '@/lib/storage-ledger';
import { useI18n } from '@/lib/i18n/store';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function StorageChoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const warehouseId = Number(id);
  const { tx } = useI18n();
  const warehouseEntities = useOpsStore((s) => s.warehouseEntities);
  const stockLotsAll = useOpsStore((s) => s.stockLots);
  const storageGoodsMovesAll = useOpsStore((s) => s.storageGoodsMoves);
  const storageCashEntriesAll = useOpsStore((s) => s.storageCashEntries);
  const warehouse = useMemo(
    () => warehouseEntities.find((w) => w.id === warehouseId),
    [warehouseEntities, warehouseId]
  );
  const lots = useMemo(
    () => stockLotsAll.filter((l) => l.warehouseId === warehouseId),
    [stockLotsAll, warehouseId]
  );
  const moves = useMemo(
    () => storageGoodsMovesAll.filter((m) => m.warehouseId === warehouseId),
    [storageGoodsMovesAll, warehouseId]
  );
  const cash = useMemo(
    () => storageCashEntriesAll.filter((e) => e.warehouseId === warehouseId),
    [storageCashEntriesAll, warehouseId]
  );

  if (!warehouse) {
    return (
      <div className="space-y-3">
        <p>{tx('ذخیره یافت نشد.', 'Storage not found.')}</p>
        <Link href="/dashboard/warehouses">
          <Button variant="outline">{tx('بازگشت', 'Back')}</Button>
        </Link>
      </div>
    );
  }

  const qty = lots.reduce((s, l) => s + l.qty, 0);
  const cashBal = cash.reduce((s, e) => s + cashNet(e), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={warehouse.name}
        description={tx(
          'این ذخیره دو حساب جدا دارد: جنسی (تخلیه و بارگیری) و نقدی (پرداخت و سنجش کرایه ذخیره).',
          'This depot has two ledgers: goods (unload/load) and cash (payments and storage rent assessment).'
        )}
        actions={
          <Link href="/dashboard/warehouses">
            <Button variant="outline" size="sm">
              <ArrowRight className="ml-2 h-4 w-4" />
              {tx('فهرست ذخایر', 'Storage list')}
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/dashboard/warehouses/${warehouseId}/goods`} className="block">
          <Card className="h-full rounded-[24px] border-slate-200 transition hover:border-teal-300 hover:shadow-lg">
            <CardContent className="flex flex-col gap-4 p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <Boxes className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold">{tx('بخش جنسی', 'Goods section')}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {tx(
                    'تخلیه به ذخیره و بارگیری از ذخیره. موجودی بر اساس قرارداد و پارتی.',
                    'Unload into the depot and load out. Stock is by contract and party.'
                  )}
                </p>
              </div>
              <p className="num text-2xl font-extrabold text-slate-900">
                {formatNumber(qty, 3)}
                <span className="ms-2 text-sm font-medium text-slate-500">
                  {tx('موجودی', 'on hand')}
                </span>
              </p>
              <p className="text-xs text-slate-400">
                {tx(`${moves.length} حرکت ثبت‌شده`, `${moves.length} movement(s)`)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/dashboard/warehouses/${warehouseId}/cash`} className="block">
          <Card className="h-full rounded-[24px] border-slate-200 transition hover:border-sky-300 hover:shadow-lg">
            <CardContent className="flex flex-col gap-4 p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Wallet className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold">{tx('بخش نقدی', 'Cash section')}</h2>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  {tx(
                    'طلب و پرداخت ذخیره، محل، نوعیت جنس، و کرایه روزانه واگن تا تاریخ ختم.',
                    'Storage claims and payments, location, product type, and daily wagon rent until the end date.'
                  )}
                </p>
              </div>
              <p className="num text-2xl font-extrabold text-slate-900">{formatCurrency(cashBal)}</p>
              <p className="text-xs text-slate-400">
                {tx(`${cash.length} قلم نقدی`, `${cash.length} cash line(s)`)}
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
