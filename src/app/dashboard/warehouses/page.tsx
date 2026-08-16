'use client';

import Link from 'next/link';
import { Eye, Plus } from 'lucide-react';
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
import { ExportButtons } from '@/components/shared/export-buttons';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { TableEmpty } from '@/components/shared/table-empty';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { inventorySkus, physicalWarehouses, products, warehouses } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';

export default function WarehousesPage() {
  const { company } = useCompanyStore();
  const legacyRows = warehouses.filter((w) => matchesCompany(w.company, company));
  const physicalRows = physicalWarehouses.filter((w) => matchesCompany(w.company, company));
  const warehouseIds = new Set(warehouses.map((w) => w.id));

  const general = legacyRows.filter((w) => w.type !== 'ترانزیت' && w.type !== 'خارجی');
  const transit = legacyRows.filter(
    (w) => w.type === 'ترانزیت' || w.type === 'خارجی' || w.location?.includes('ترانزیت')
  );

  const stockSum = (list: typeof legacyRows) => {
    const out: Record<string, number> = {};
    products.forEach((p) => {
      out[p.code] = list.reduce((s, w) => s + (w.stock?.[p.code] ?? 0), 0);
    });
    return out;
  };

  const generalStock = stockSum(general.length ? general : legacyRows);
  const transitStock = stockSum(transit);
  const physicalColSpan = 3 + inventorySkus.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ذخایر و گدام اجناس"
        description="گدام → جنس → مقدار — موجودی فیزیکی به تفکیک کالا و شرکت"
        actions={
          <>
            <ExportButtons
              filename="warehouses"
              title="ذخایر و گدام"
              columns={[
                { key: 'name', label: 'نام ذخیره' },
                { key: 'location', label: 'محل' },
                ...inventorySkus.map((p) => ({ key: p.code, label: p.name })),
                { key: 'total', label: 'مجموع' },
              ]}
              rows={physicalRows.map((w) => ({
                name: w.name,
                location: w.location,
                ...Object.fromEntries(inventorySkus.map((p) => [p.code, w.stock?.[p.code] ?? 0])),
                total: Object.values(w.stock || {}).reduce((s: number, q) => s + Number(q), 0),
              }))}
            />
            <CompanySwitcher />
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              گدام جدید
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {legacyRows.length === 0 ? (
          <Card className="md:col-span-2 xl:col-span-4">
            <CardContent className="py-10 text-center text-sm text-slate-500">
              هنوز ذخیره‌ای ثبت نشده است. پس از ثبت گدام، موجودی اینجا نمایش داده می‌شود.
            </CardContent>
          </Card>
        ) : (
          legacyRows.map((w) => {
            const total = Object.values(w.stock || {}).reduce((s: number, q) => s + Number(q), 0);
            const fill = Math.min(100, (total / Number(w.capacity || 1)) * 100);
            const value = products.reduce(
              (s, p) => s + (w.stock[p.code] ?? 0) * (w.unitPrice?.[p.code] ?? 0),
              0
            );
            return (
              <Card key={w.id} className="transition-shadow hover:shadow-md">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">{w.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{w.location}</p>
                    </div>
                    <Badge variant="info">{w.type || 'گدام'}</Badge>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-500">
                      <span>پر شدن</span>
                      <span className="num">{formatNumber(fill, 0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-[var(--brand)]" style={{ width: `${fill}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">موجودی</p>
                      <p className="font-semibold num">{formatNumber(total, 0)} تن</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">ارزش</p>
                      <p className="font-semibold num">{formatCurrency(value)}</p>
                    </div>
                  </div>
                  <Link href={`/dashboard/warehouses/${w.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="ml-2 h-4 w-4" />
                      صفحه گدام
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">موجودی عمومی</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {products.map((p) => (
              <div key={p.code} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">{p.name}</p>
                <p className="mt-1 font-bold num">{formatNumber(generalStock[p.code] ?? 0, 0)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">موجودی ترانزیت / خارجی</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {products.map((p) => (
              <div key={p.code} className="rounded-xl border border-amber-100 bg-amber-50/50 px-3 py-2">
                <p className="text-xs text-slate-500">{p.name}</p>
                <p className="mt-1 font-bold num">{formatNumber(transitStock[p.code] ?? 0, 0)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">موجودی فیزیکی — گدام → جنس → مقدار</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 px-0">
          <div className="table-scroll table-scroll-wide">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><BiLabel fa="نام ذخیره" en="Depot" /></TableHead>
                <TableHead><BiLabel fa="محل ذخیره" en="Location" /></TableHead>
                {inventorySkus.map((p) => (
                  <TableHead key={p.code}>
                    <BiLabel fa={p.name} en={p.nameEn} />
                  </TableHead>
                ))}
                <TableHead>موجودی عمومی ردیف</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {physicalRows.length === 0 ? (
                <TableEmpty colSpan={physicalColSpan} />
              ) : (
                physicalRows.map((w) => {
                  const total = Object.values(w.stock || {}).reduce((s: number, q) => s + Number(q), 0);
                  const hasDetail = warehouseIds.has(w.id);
                  return (
                    <TableRow key={w.id}>
                      <TableCell className="font-semibold">{w.name}</TableCell>
                      <TableCell>{w.location}</TableCell>
                      {inventorySkus.map((p) => (
                        <TableCell key={p.code} className="num">
                          {formatNumber(w.stock?.[p.code] ?? 0, 0)}
                        </TableCell>
                      ))}
                      <TableCell className="num font-semibold">{formatNumber(total, 0)}</TableCell>
                      <TableCell>
                        {hasDetail ? (
                          <Link href={`/dashboard/warehouses/${w.id}`}>
                            <Button size="icon" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
