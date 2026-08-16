'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
import { RecordActions } from '@/components/shared/record-actions';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { contracts as initialContracts } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function ContractsPage() {
  const { company } = useCompanyStore();
  const [items, setItems] = useState(initialContracts);
  const rows = items.filter((c) => matchesCompany(c.company, company));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="خلاصه عمومی قراردادها"
        description="Contract Overview — آمد، تخلیه، فروش، کسری، ضایعات، قابل فروش، ترانزیت"
        actions={
          <>
            <ExportButtons
              filename="contracts"
              title="خلاصه قراردادها"
              columns={[
                { key: 'number', label: 'شماره قرارداد' },
                { key: 'supplierName', label: 'شرکت طرف' },
                { key: 'product', label: 'نوع جنس' },
                { key: 'totalQty', label: 'مقدار کل' },
                { key: 'arrived', label: 'آمد' },
                { key: 'unloaded', label: 'تخلیه' },
                { key: 'sold', label: 'فروش' },
                { key: 'shortage', label: 'کسری' },
                { key: 'waste', label: 'ضایعات' },
                { key: 'sellable', label: 'قابل فروش' },
                { key: 'transit', label: 'ترانزیت' },
                { key: 'location', label: 'محل' },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Link href="/dashboard/contracts/new">
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                قرارداد جدید
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">تعداد قرارداد فعال</p>
            <p className="mt-1 text-2xl font-bold num">{rows.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">مجموع مقدار قرارداد</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatNumber(rows.reduce((s, c) => s + c.totalQty, 0), 0)} تن
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">در ترانزیت</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatNumber(rows.reduce((s, c) => s + c.transit, 0), 0)} تن
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">جدول قراردادها</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره قرارداد</TableHead>
                <TableHead>شرکت طرف قرارداد</TableHead>
                <TableHead>نوع جنس</TableHead>
                <TableHead>مقدار کل قرارداد</TableHead>
                <TableHead>آمد واگن/موتر</TableHead>
                <TableHead>تخلیه</TableHead>
                <TableHead>فروش</TableHead>
                <TableHead>کسری</TableHead>
                <TableHead>ضایعات</TableHead>
                <TableHead>قابل فروش</TableHead>
                <TableHead>ترانزیت</TableHead>
                <TableHead>محل</TableHead>
                <TableHead>شرکت</TableHead>
                <TableHead className="text-center">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={14} message="هنوز قراردادی ثبت نشده است" />
              ) : null}
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold num">{c.number}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/suppliers/${c.supplierId}`}
                      className="hover:underline text-[var(--brand)]"
                    >
                      {c.supplierName}
                    </Link>
                  </TableCell>
                  <TableCell>{c.product}</TableCell>
                  <TableCell className="num">{formatNumber(c.totalQty, 0)}</TableCell>
                  <TableCell className="num">
                    {c.wagons ? `${c.wagons} / ` : ''}
                    {formatNumber(c.arrived, 0)}
                  </TableCell>
                  <TableCell className="num">{formatNumber(c.unloaded, 0)}</TableCell>
                  <TableCell className="num">{formatNumber(c.sold, 0)}</TableCell>
                  <TableCell className="num text-amber-700">
                    {formatNumber(c.shortage, 0)}
                  </TableCell>
                  <TableCell className="num text-red-600">
                    {formatNumber(c.waste, 0)}
                  </TableCell>
                  <TableCell className="num font-semibold text-emerald-700">
                    {formatNumber(c.sellable, 0)}
                  </TableCell>
                  <TableCell className="num">{formatNumber(c.transit, 0)}</TableCell>
                  <TableCell>{c.location}</TableCell>
                  <TableCell>
                    <Badge variant="info">
                      {c.company === 'arya' ? 'آریا' : 'ترکمن'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <RecordActions
                      title="قرارداد"
                      detailHref={`/dashboard/contracts/${c.id}`}
                      row={{
                        number: c.number,
                        supplierName: c.supplierName,
                        product: c.product,
                        totalQty: c.totalQty,
                        location: c.location,
                        sellable: c.sellable,
                      }}
                      fields={[
                        { key: 'number', label: 'شماره' },
                        { key: 'supplierName', label: 'تأمین‌کننده' },
                        { key: 'product', label: 'کالا' },
                        { key: 'totalQty', label: 'مقدار کل' },
                        { key: 'location', label: 'محل' },
                        { key: 'sellable', label: 'قابل فروش' },
                      ]}
                      onSave={(next) => {
                        setItems((prev) =>
                          prev.map((r) =>
                            r.id === c.id
                              ? {
                                  ...r,
                                  number: String(next.number ?? r.number),
                                  supplierName: String(next.supplierName ?? r.supplierName),
                                  product: String(next.product ?? r.product),
                                  totalQty: Number(next.totalQty ?? r.totalQty),
                                  location: String(next.location ?? r.location),
                                  sellable: Number(next.sellable ?? r.sellable),
                                }
                              : r
                          )
                        );
                      }}
                      onDelete={() => setItems((prev) => prev.filter((r) => r.id !== c.id))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">هنوز قراردادی ثبت نشده است</p>
              ) : (
                rows.map((c) => (
                  <MobileRecordCard
                    key={c.id}
                    title={c.supplierName}
                    subtitle={`قرارداد ${c.number} · ${c.product}`}
                    badge={
                      <Badge variant="info">{c.company === 'arya' ? 'آریا' : 'ترکمن'}</Badge>
                    }
                    metrics={[
                      { label: 'مقدار کل', value: formatNumber(c.totalQty, 0) },
                      { label: 'قابل فروش', value: formatNumber(c.sellable, 0) },
                      { label: 'تاریخ / محل', value: c.location },
                      { label: 'ترانزیت', value: formatNumber(c.transit, 0) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="آمد" value={formatNumber(c.arrived, 0)} />
                        <ExtraRow label="تخلیه" value={formatNumber(c.unloaded, 0)} />
                        <ExtraRow label="فروش" value={formatNumber(c.sold, 0)} />
                        <ExtraRow label="کسری" value={formatNumber(c.shortage, 0)} />
                        <ExtraRow label="ضایعات" value={formatNumber(c.waste, 0)} />
                      </>
                    }
                    footer={
                      <RecordActions
                        layout="buttons"
                        title="قرارداد"
                        detailHref={`/dashboard/contracts/${c.id}`}
                        row={{
                          number: c.number,
                          supplierName: c.supplierName,
                          product: c.product,
                          totalQty: c.totalQty,
                          location: c.location,
                          sellable: c.sellable,
                        }}
                        fields={[
                          { key: 'number', label: 'شماره' },
                          { key: 'supplierName', label: 'تأمین‌کننده' },
                          { key: 'product', label: 'کالا' },
                          { key: 'totalQty', label: 'مقدار کل' },
                          { key: 'location', label: 'محل' },
                          { key: 'sellable', label: 'قابل فروش' },
                        ]}
                        onSave={(next) => {
                          setItems((prev) =>
                            prev.map((r) =>
                              r.id === c.id
                                ? {
                                    ...r,
                                    number: String(next.number ?? r.number),
                                    supplierName: String(next.supplierName ?? r.supplierName),
                                    product: String(next.product ?? r.product),
                                    totalQty: Number(next.totalQty ?? r.totalQty),
                                    location: String(next.location ?? r.location),
                                    sellable: Number(next.sellable ?? r.sellable),
                                  }
                                : r
                            )
                          );
                        }}
                        onDelete={() => setItems((prev) => prev.filter((r) => r.id !== c.id))}
                      />
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <p className="text-xs text-slate-500">
        قیمت نمونه: {rows[0] ? formatCurrency(rows[0].pricePerUnit) + '/تن' : '-'}
      </p>
    </div>
  );
}
