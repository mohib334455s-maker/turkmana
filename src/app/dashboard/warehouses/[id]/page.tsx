'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
import { PageHeader } from '@/components/shared/page-header';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { products, warehouseMovements, warehouses } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { ExportButtons } from '@/components/shared/export-buttons';

const typeLabel = {
  in: 'ورود',
  out: 'خروج',
  transfer: 'انتقال',
  reserve: 'رزرو',
  waste: 'ضایعات',
  shortage: 'کسری',
} as const;

export default function WarehouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const warehouse = warehouses.find((w) => w.id === Number(id));
  const movements = warehouseMovements[Number(id)] ?? [];

  if (!warehouse) {
    return (
      <div className="space-y-4">
        <p>گدام یافت نشد.</p>
        <Link href="/dashboard/warehouses">
          <Button variant="outline">بازگشت</Button>
        </Link>
      </div>
    );
  }

  const totalStock = Object.values(warehouse.stock || {}).reduce(
    (s: number, q) => s + Number(q),
    0
  );
  const totalReserved = Object.values(warehouse.reserved || {}).reduce(
    (s: number, q) => s + Number(q),
    0
  );
  const totalValue = products.reduce(
    (s, p) =>
      s + Number(warehouse.stock?.[p.code] ?? 0) * Number(warehouse.unitPrice?.[p.code] ?? 0),
    0
  );
  const free = Number(warehouse.capacity || 0) - totalStock;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`گدام ${warehouse.name}`}
        description={warehouse.location}
        actions={
          <>
            <ExportButtons
              filename={`warehouse-${warehouse.name}`}
              title={`گدام ${warehouse.name}`}
              columns={[
                { key: 'product', label: 'کالا' },
                { key: 'stock', label: 'موجودی' },
                { key: 'reserved', label: 'رزرو' },
                { key: 'price', label: 'نرخ' },
              ]}
              rows={products.map((p) => ({
                product: p.name,
                stock: warehouse.stock?.[p.code] ?? 0,
                reserved: warehouse.reserved?.[p.code] ?? 0,
                price: warehouse.unitPrice?.[p.code] ?? 0,
              }))}
            />
            <Link href="/dashboard/warehouses">
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
          ['ظرفیت', `${formatNumber(warehouse.capacity, 0)} تن`],
          ['موجودی', `${formatNumber(totalStock, 0)} تن`],
          ['فضای خالی', `${formatNumber(free, 0)} تن`],
          ['ارزش مالی', formatCurrency(totalValue)],
          ['رزرو', `${formatNumber(totalReserved, 0)} تن`],
          ['ضایعات', `${formatNumber(warehouse.waste, 0)} تن`],
          ['کسری', `${formatNumber(warehouse.shortage, 0)} تن`],
          ['نوع', warehouse.type],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">موجودی</TabsTrigger>
          <TabsTrigger value="moves">ورود / خروج / انتقال</TabsTrigger>
        </TabsList>

        <TabsContent value="stock">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">موجودی به تفکیک کالا</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-4 md:pb-0">
              <ResponsiveData
                breakpoint="md"
                table={
                  <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کالا</TableHead>
                    <TableHead>موجودی</TableHead>
                    <TableHead>رزرو</TableHead>
                    <TableHead>آزاد</TableHead>
                    <TableHead>نرخ</TableHead>
                    <TableHead>ارزش</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const stock = warehouse.stock[p.code] ?? 0;
                    const reserved = warehouse.reserved[p.code] ?? 0;
                    const price = warehouse.unitPrice?.[p.code] ?? 0;
                    return (
                      <TableRow key={p.code}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="num">{formatNumber(stock, 0)}</TableCell>
                        <TableCell className="num">
                          {formatNumber(reserved, 0)}
                        </TableCell>
                        <TableCell className="num text-emerald-700">
                          {formatNumber(stock - reserved, 0)}
                        </TableCell>
                        <TableCell className="num">{formatCurrency(price)}</TableCell>
                        <TableCell className="num font-semibold">
                          {formatCurrency(stock * price)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
                  </div>
                }
                cards={products.map((p) => {
                  const stock = warehouse.stock[p.code] ?? 0;
                  const reserved = warehouse.reserved[p.code] ?? 0;
                  const price = warehouse.unitPrice?.[p.code] ?? 0;
                  const available = stock - reserved;
                  const empty = available <= 0;
                  const low = available > 0 && available < 50;
                  return (
                    <MobileRecordCard
                      key={p.code}
                      title={p.name}
                      subtitle={`SKU ${p.code}`}
                      badge={
                        <Badge variant={empty ? 'danger' : low ? 'warning' : 'success'}>
                          {empty ? 'ناموجود' : low ? 'کم‌موجود' : 'موجود'}
                        </Badge>
                      }
                      metrics={[
                        { label: 'موجودی', value: formatNumber(stock, 0) },
                        { label: 'ارزش', value: formatCurrency(stock * price) },
                        { label: 'آزاد', value: formatNumber(available, 0) },
                        { label: 'رزرو', value: formatNumber(reserved, 0) },
                      ]}
                    />
                  );
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moves">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">حرکات گدام</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-4 lg:pb-0">
              {movements.length ? (
                <ResponsiveData
                  table={
                    <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>نوع</TableHead>
                      <TableHead>کالا</TableHead>
                      <TableHead>مقدار</TableHead>
                      <TableHead>مرجع</TableHead>
                      <TableHead>توضیح</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="num">{m.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.type === 'in'
                                ? 'success'
                                : m.type === 'out'
                                  ? 'danger'
                                  : m.type === 'shortage' || m.type === 'waste'
                                    ? 'warning'
                                    : 'info'
                            }
                          >
                            {typeLabel[m.type as keyof typeof typeLabel] ?? m.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.product}</TableCell>
                        <TableCell className="num">{formatNumber(Number(m.qty), 1)}</TableCell>
                        <TableCell className="num">{m.ref}</TableCell>
                        <TableCell>{m.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                    </div>
                  }
                  cards={movements.map((m) => (
                    <MobileRecordCard
                      key={m.id}
                      title={m.product}
                      subtitle={m.date}
                      badge={
                        <Badge
                          variant={
                            m.type === 'in'
                              ? 'success'
                              : m.type === 'out'
                                ? 'danger'
                                : m.type === 'shortage' || m.type === 'waste'
                                  ? 'warning'
                                  : 'info'
                          }
                        >
                          {typeLabel[m.type as keyof typeof typeLabel] ?? m.type}
                        </Badge>
                      }
                      metrics={[
                        { label: 'مقدار', value: formatNumber(Number(m.qty), 1) },
                        { label: 'مرجع', value: m.ref },
                      ]}
                      extra={<ExtraRow label="توضیح" value={m.notes || '-'} />}
                    />
                  ))}
                />
              ) : (
                <p className="p-6 text-sm text-slate-500">
                  هنوز حرکتی برای این گدام ثبت نشده است.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
