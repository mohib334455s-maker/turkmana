'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { TableEmpty } from '@/components/shared/table-empty';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { products, warehouses } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function InventoryPage() {
  const { company } = useCompanyStore();
  const rows = warehouses.filter((w) => matchesCompany(w.company, company));

  const totals = products.map((p) => {
    const qty = rows.reduce((s, w) => s + (w.stock[p.code] ?? 0), 0);
    const reserved = rows.reduce((s, w) => s + (w.reserved[p.code] ?? 0), 0);
    const value = rows.reduce(
      (s, w) => s + (w.stock[p.code] ?? 0) * (w.unitPrice[p.code] ?? 0),
      0
    );
    return { ...p, qty, reserved, available: qty - reserved, value };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="موجودی کل"
        description="موجودی، رزرو، آزاد و ارزش — تجمیع همه گدام‌ها"
        actions={
          <>
            <ExportButtons
              filename="inventory"
              title="موجودی کل"
              columns={[
                { key: 'name', label: 'کالا' },
                { key: 'qty', label: 'موجودی' },
                { key: 'reserved', label: 'رزرو' },
                { key: 'available', label: 'قابل فروش' },
                { key: 'value', label: 'ارزش' },
              ]}
              rows={totals.map((t) => ({
                name: t.name,
                qty: t.qty,
                reserved: t.reserved,
                available: t.available,
                value: t.value,
              }))}
            />
            <CompanySwitcher />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">موجودی کل</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatNumber(
                totals.reduce((s, t) => s + t.qty, 0),
                0
              )}{' '}
              تن
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">رزرو شده</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatNumber(
                totals.reduce((s, t) => s + t.reserved, 0),
                0
              )}{' '}
              تن
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">ارزش موجودی</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatCurrency(totals.reduce((s, t) => s + t.value, 0))}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">به تفکیک کالا</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
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
                <TableHead>قابل فروش</TableHead>
                <TableHead>ارزش</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totals.map((t) => (
                <TableRow key={t.code}>
                  <TableCell className="font-semibold">{t.name}</TableCell>
                  <TableCell className="num">{formatNumber(t.qty, 0)}</TableCell>
                  <TableCell className="num">{formatNumber(t.reserved, 0)}</TableCell>
                  <TableCell className="num text-emerald-700">
                    {formatNumber(t.available, 0)}
                  </TableCell>
                  <TableCell className="num font-semibold">
                    {formatCurrency(t.value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
              </div>
            }
            cards={
              totals.map((t) => {
                  const low = t.available > 0 && t.available < 50;
                  const empty = t.available <= 0;
                  return (
                    <MobileRecordCard
                      key={t.code}
                      title={t.name}
                      subtitle={`SKU ${t.code}`}
                      badge={
                        <Badge variant={empty ? 'danger' : low ? 'warning' : 'success'}>
                          {empty ? 'ناموجود' : low ? 'کم‌موجود' : 'موجود'}
                        </Badge>
                      }
                      metrics={[
                        { label: 'موجودی فعلی', value: formatNumber(t.qty, 0) },
                        { label: 'ارزش موجودی', value: formatCurrency(t.value) },
                        { label: 'قابل فروش', value: formatNumber(t.available, 0) },
                        { label: 'رزرو', value: formatNumber(t.reserved, 0) },
                      ]}
                      preview={
                        <div className="mt-3 px-0.5">
                          <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                            <span>نسبت آزاد</span>
                            <span className="num">
                              {t.qty ? Math.round((t.available / t.qty) * 100) : 0}%
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={empty ? 'h-full bg-red-400' : low ? 'h-full bg-amber-400' : 'h-full bg-teal-500'}
                              style={{ width: `${t.qty ? Math.min(100, (t.available / t.qty) * 100) : 0}%` }}
                            />
                          </div>
                        </div>
                      }
                    />
                  );
                })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
