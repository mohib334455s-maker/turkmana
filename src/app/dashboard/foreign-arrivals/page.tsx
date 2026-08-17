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
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { CompanyKey, ForeignArrivalRecord } from '@/lib/demo-data';
import { formatNumber } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';

const EMPTY: OpsRow[] = [];

export default function ForeignArrivalsPage() {
  const { company } = useCompanyStore();
  const items = useOpsStore((s) => (s.lists.foreignArrivals ?? EMPTY) as unknown as ForeignArrivalRecord[]);
  const setList = useOpsStore((s) => s.setList);
  const addToList = useOpsStore((s) => s.addToList);
  const [createOpen, setCreateOpen] = useState(false);
  const rows = items.filter((a) => matchesCompany(a.company, company));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="لیست وارده شرکت"
        description="کالاهایی که از خارج در حال ورود هستند — جزئیات، ویرایش و حذف"
        actions={
          <>
            <ExportButtons
              filename="foreign-arrivals"
              title="وارده‌های خارجی"
              columns={[
                { key: 'number', label: 'شماره' },
                { key: 'dateJalali', label: 'تاریخ' },
                { key: 'supplier', label: 'فروشنده' },
                { key: 'product', label: 'نوع جنس' },
                { key: 'contractNumber', label: 'قرارداد' },
                { key: 'shipmentNo', label: 'شماره محموله' },
                { key: 'originCountry', label: 'کشور مبدأ' },
                { key: 'border', label: 'مرز' },
                { key: 'wagons', label: 'واگن/موتر' },
                { key: 'seymirWeight', label: 'وزن/مقدار' },
                { key: 'unloadedWagons', label: 'تخلیه‌شده' },
                { key: 'unloadedWeight', label: 'وزن تخلیه' },
                { key: 'shortage', label: 'کسری' },
                { key: 'location', label: 'محل' },
                { key: 'destWarehouse', label: 'گدام مقصد' },
                { key: 'status', label: 'وضعیت' },
                { key: 'notes', label: 'ملاحظات' },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              وارده جدید
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">وارده شرکت</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><BiLabel fa="شماره" en="No." /></TableHead>
                <TableHead><BiLabel fa="تاریخ ورود" en="Arrival date" /></TableHead>
                <TableHead><BiLabel fa="شرکت فروشنده" en="Seller" /></TableHead>
                <TableHead><BiLabel fa="نوعیت جنس" en="Product type" /></TableHead>
                <TableHead><BiLabel fa="قرارداد" en="Contract" /></TableHead>
                <TableHead><BiLabel fa="شماره محموله" en="Shipment no." /></TableHead>
                <TableHead><BiLabel fa="کشور مبدأ" en="Origin" /></TableHead>
                <TableHead><BiLabel fa="مرز ورودی" en="Border" /></TableHead>
                <TableHead><BiLabel fa="تعداد واگن/موتر" en="Wagons/trucks" /></TableHead>
                <TableHead><BiLabel fa="وزن سیمیر" en="Seymir weight" /></TableHead>
                <TableHead><BiLabel fa="تخلیه‌شده" en="Unloaded count" /></TableHead>
                <TableHead><BiLabel fa="وزن تخلیه" en="Unloaded weight" /></TableHead>
                <TableHead><BiLabel fa="کسرات" en="Shortage" /></TableHead>
                <TableHead><BiLabel fa="محل" en="Location" /></TableHead>
                <TableHead><BiLabel fa="گدام مقصد" en="Warehouse" /></TableHead>
                <TableHead><BiLabel fa="وضعیت" en="Status" /></TableHead>
                <TableHead><BiLabel fa="شرکت" en="Company" /></TableHead>
                <TableHead><BiLabel fa="ملاحظات" en="Notes" /></TableHead>
                <TableHead className="text-center"><BiLabel fa="عملیات" en="Actions" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={19} message="هنوز وارده خارجی ثبت نشده است" />
              ) : null}
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold num">{a.number}</TableCell>
                  <TableCell className="num">{a.dateJalali || '-'}</TableCell>
                  <TableCell>
                    {a.supplierId ? (
                      <Link
                        href={`/dashboard/suppliers/${a.supplierId}`}
                        className="text-[var(--brand)] hover:underline"
                      >
                        {a.supplier || '-'}
                      </Link>
                    ) : (
                      a.supplier || '-'
                    )}
                  </TableCell>
                  <TableCell>{a.product}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/contracts/${a.contractId}`}
                      className="text-[var(--brand)] hover:underline num"
                    >
                      {a.contractNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="num">{a.shipmentNo || '-'}</TableCell>
                  <TableCell>{a.originCountry || '-'}</TableCell>
                  <TableCell>{a.border || '-'}</TableCell>
                  <TableCell className="num">{a.wagons}</TableCell>
                  <TableCell className="num">{formatNumber(a.seymirWeight, 1)}</TableCell>
                  <TableCell className="num">{a.unloadedWagons}</TableCell>
                  <TableCell className="num">{formatNumber(a.unloadedWeight, 1)}</TableCell>
                  <TableCell className="num text-amber-700 font-semibold">
                    {formatNumber(a.shortage, 1)}
                  </TableCell>
                  <TableCell>{a.location}</TableCell>
                  <TableCell>{a.destWarehouse || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{a.status || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">
                      {a.company === 'arya' ? 'آریا' : 'ترکمن'}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.notes || '-'}</TableCell>
                  <TableCell>
                    <RecordActions
                      title="وارده خارجی"
                      row={{
                        number: a.number,
                        product: a.product,
                        contractNumber: a.contractNumber,
                        location: a.location,
                        seymirWeight: a.seymirWeight,
                        unloadedWeight: a.unloadedWeight,
                        shortage: a.shortage,
                        notes: a.notes,
                      }}
                      fields={[
                        { key: 'number', label: 'شماره' },
                        { key: 'product', label: 'کالا' },
                        { key: 'contractNumber', label: 'قرارداد' },
                        { key: 'location', label: 'محل' },
                        { key: 'seymirWeight', label: 'وزن سیمیر' },
                        { key: 'unloadedWeight', label: 'وزن تخلیه' },
                        { key: 'shortage', label: 'کسری' },
                        { key: 'notes', label: 'ملاحظات', multiline: true },
                      ]}
                      onSave={(next) => {
                        setList(
                          'foreignArrivals',
                          items.map((r) =>
                            r.id === a.id
                              ? {
                                  ...r,
                                  number: String(next.number ?? r.number),
                                  product: String(next.product ?? r.product),
                                  location: String(next.location ?? r.location),
                                  seymirWeight: Number(next.seymirWeight ?? r.seymirWeight),
                                  unloadedWeight: Number(next.unloadedWeight ?? r.unloadedWeight),
                                  shortage: Number(next.shortage ?? r.shortage),
                                  notes: String(next.notes ?? r.notes),
                                }
                              : r
                          )
                        );
                      }}
                      onDelete={() => setList('foreignArrivals', items.filter((r) => r.id !== a.id))}
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
                <p className="py-10 text-center text-sm text-slate-500">هنوز وارده خارجی ثبت نشده است</p>
              ) : (
                rows.map((a) => (
                  <MobileRecordCard
                    key={a.id}
                    title={a.number}
                    subtitle={`${a.product} · ${a.location}`}
                    badge={
                      <Badge variant="info">{a.status || (a.company === 'arya' ? 'آریا' : 'ترکمن')}</Badge>
                    }
                    metrics={[
                      { label: 'تاریخ', value: a.dateJalali || '-' },
                      { label: 'فروشنده', value: a.supplier || '-' },
                      { label: 'مقدار کل', value: formatNumber(a.seymirWeight, 1) },
                      { label: 'تخلیه', value: formatNumber(a.unloadedWeight, 1) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="محموله" value={a.shipmentNo || '-'} />
                        <ExtraRow label="مبدأ" value={a.originCountry || '-'} />
                        <ExtraRow label="مرز" value={a.border || '-'} />
                        <ExtraRow label="گدام مقصد" value={a.destWarehouse || '-'} />
                        <ExtraRow label="واگن/موتر" value={a.wagons} />
                        <ExtraRow label="کسری" value={formatNumber(a.shortage, 1)} />
                        <ExtraRow label="ملاحظات" value={a.notes || '-'} />
                      </>
                    }
                    footer={
                      <RecordActions
                        layout="buttons"
                        title="وارده خارجی"
                        row={{
                          number: a.number,
                          product: a.product,
                          contractNumber: a.contractNumber,
                          location: a.location,
                          seymirWeight: a.seymirWeight,
                          unloadedWeight: a.unloadedWeight,
                          shortage: a.shortage,
                          notes: a.notes,
                        }}
                        fields={[
                          { key: 'number', label: 'شماره' },
                          { key: 'product', label: 'کالا' },
                          { key: 'contractNumber', label: 'قرارداد' },
                          { key: 'location', label: 'محل' },
                          { key: 'seymirWeight', label: 'وزن سیمیر' },
                          { key: 'unloadedWeight', label: 'وزن تخلیه' },
                          { key: 'shortage', label: 'کسری' },
                          { key: 'notes', label: 'ملاحظات', multiline: true },
                        ]}
                        onSave={(next) => {
                          setList(
                            'foreignArrivals',
                            items.map((r) =>
                              r.id === a.id
                                ? {
                                    ...r,
                                    number: String(next.number ?? r.number),
                                    product: String(next.product ?? r.product),
                                    location: String(next.location ?? r.location),
                                    seymirWeight: Number(next.seymirWeight ?? r.seymirWeight),
                                    unloadedWeight: Number(next.unloadedWeight ?? r.unloadedWeight),
                                    shortage: Number(next.shortage ?? r.shortage),
                                    notes: String(next.notes ?? r.notes),
                                  }
                                : r
                            )
                          );
                        }}
                        onDelete={() => setList('foreignArrivals', items.filter((r) => r.id !== a.id))}
                      />
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="وارده جدید"
        description="فرم کوتاه ثبت وارده خارجی"
        fields={[
          { key: 'number', label: 'شماره', required: true, dir: 'ltr', placeholder: 'FA-001' },
          { key: 'dateJalali', label: 'تاریخ', placeholder: '1405/01/01' },
          { key: 'supplier', label: 'فروشنده', required: true },
          { key: 'product', label: 'نوع جنس', required: true },
          { key: 'contractNumber', label: 'قرارداد' },
          { key: 'seymirWeight', label: 'وزن/مقدار', type: 'number' },
          { key: 'location', label: 'محل' },
          { key: 'originCountry', label: 'کشور مبدأ' },
          {
            key: 'company',
            label: 'شرکت',
            type: 'select',
            options: [
              { value: 'arya', label: 'آریا' },
              { value: 'turkmen', label: 'ترکمن' },
            ],
          },
        ]}
        submitLabel="ثبت وارده"
        onSubmit={(v) => {
          addToList('foreignArrivals', {
            number: v.number.trim(),
            dateJalali: v.dateJalali,
            product: v.product,
            supplier: v.supplier,
            supplierId: 0,
            contractId: 0,
            contractNumber: v.contractNumber,
            shipmentNo: '',
            wagons: 0,
            seymirWeight: Number(v.seymirWeight || 0),
            unloadedWagons: 0,
            unloadedWeight: 0,
            shortage: 0,
            location: v.location,
            originCountry: v.originCountry,
            border: '',
            destWarehouse: '',
            status: 'در راه',
            company: (v.company as CompanyKey) || 'arya',
            notes: '',
          });
        }}
      />
    </div>
  );
}
