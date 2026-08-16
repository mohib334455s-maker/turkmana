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
import { goodsArrivals as initialRows } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';

export default function GoodsArrivalsPage() {
  const { company } = useCompanyStore();
  const [items, setItems] = useState(initialRows);
  const rows = items.filter((g) => matchesCompany(g.company, company));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="ثبت محموله / CMR و حمل‌ونقل"
        description="تاریخ، فروشنده، قرارداد، محل، واگن، CMR، وزن‌ها، مسیر، وضعیت و هزینه‌های مرتبط"
        actions={
          <>
            <ExportButtons
              filename="goods-arrivals"
              title="ثبت محموله CMR"
              columns={[
                { key: 'number', label: 'شماره' },
                { key: 'dateJalali', label: 'تاریخ' },
                { key: 'supplier', label: 'فروشنده' },
                { key: 'loaderCompany', label: 'شرکت بارکننده' },
                { key: 'contractNumber', label: 'قرارداد' },
                { key: 'product', label: 'کالا' },
                { key: 'location', label: 'محل' },
                { key: 'loadSite', label: 'محل بارگیری' },
                { key: 'unloadSite', label: 'محل تخلیه' },
                { key: 'route', label: 'مسیر' },
                { key: 'wagonNumber', label: 'واگن' },
                { key: 'railwayCarriageNo', label: 'Railway Carriage' },
                { key: 'description', label: 'Description' },
                { key: 'cmrNumber', label: 'CMR' },
                { key: 'cmrWeight', label: 'CMR Weight' },
                { key: 'netWeight', label: 'Net Weight' },
                { key: 'weightDiff', label: 'اختلاف' },
                { key: 'pricePerUnit', label: 'قیمت/تن' },
                { key: 'totalPrice', label: 'Total Price' },
                { key: 'balance', label: 'Balance' },
                { key: 'currency', label: 'ارز' },
                { key: 'status', label: 'وضعیت' },
                { key: 'notes', label: 'ملاحظات' },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              ثبت وارده
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">لیست محموله‌ها / CMR</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><BiLabel fa="شماره" en="No." /></TableHead>
                <TableHead><BiLabel fa="تاریخ" en="Date" /></TableHead>
                <TableHead><BiLabel fa="فروشنده" en="Seller" /></TableHead>
                <TableHead><BiLabel fa="شرکت بارکننده" en="Loader" /></TableHead>
                <TableHead><BiLabel fa="قرارداد" en="Contract" /></TableHead>
                <TableHead><BiLabel fa="نوع جنس" en="Product" /></TableHead>
                <TableHead><BiLabel fa="محل" en="Location" /></TableHead>
                <TableHead><BiLabel fa="محل بارگیری" en="Load site" /></TableHead>
                <TableHead><BiLabel fa="محل تخلیه" en="Unload site" /></TableHead>
                <TableHead><BiLabel fa="مسیر" en="Route" /></TableHead>
                <TableHead><BiLabel fa="شماره واگن" en="Wagon no." /></TableHead>
                <TableHead><BiLabel fa="شماره واگن ریل" en="Railway carriage" /></TableHead>
                <TableHead><BiLabel fa="توضیحات" en="Description" /></TableHead>
                <TableHead><BiLabel fa="شماره CMR" en="CMR no." /></TableHead>
                <TableHead><BiLabel fa="وزن CMR" en="CMR weight" /></TableHead>
                <TableHead><BiLabel fa="وزن خالص" en="Net weight" /></TableHead>
                <TableHead><BiLabel fa="تفاوت CMR و خالص" en="CMR − NW" /></TableHead>
                <TableHead><BiLabel fa="قیمت فی تن" en="Price / ton" /></TableHead>
                <TableHead><BiLabel fa="قیمت مجموع" en="Total price" /></TableHead>
                <TableHead><BiLabel fa="بیلانس" en="Balance" /></TableHead>
                <TableHead><BiLabel fa="ارز" en="Currency" /></TableHead>
                <TableHead><BiLabel fa="وضعیت محموله" en="Status" /></TableHead>
                <TableHead><BiLabel fa="ملاحظات" en="Notes" /></TableHead>
                <TableHead className="text-center"><BiLabel fa="عملیات" en="Actions" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={24} message="هنوز محموله ثبت نشده است" />
              ) : null}
              {rows.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-semibold num">{g.number}</TableCell>
                  <TableCell className="num">{g.dateJalali}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/suppliers/${g.supplierId}`}
                      className="text-[var(--brand)] hover:underline"
                    >
                      {g.supplier}
                    </Link>
                  </TableCell>
                  <TableCell>{g.loaderCompany || '-'}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/contracts/${g.contractId}`}
                      className="text-[var(--brand)] hover:underline num"
                    >
                      {g.contractNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{g.product || '-'}</TableCell>
                  <TableCell>{g.location}</TableCell>
                  <TableCell>{g.loadSite || '-'}</TableCell>
                  <TableCell>{g.unloadSite || '-'}</TableCell>
                  <TableCell className="max-w-[160px] whitespace-normal">{g.route || '-'}</TableCell>
                  <TableCell className="num">{g.wagonNumber}</TableCell>
                  <TableCell className="num">{g.railwayCarriageNo || '-'}</TableCell>
                  <TableCell className="max-w-[140px] whitespace-normal">{g.description || '-'}</TableCell>
                  <TableCell className="num">{g.cmrNumber}</TableCell>
                  <TableCell className="num">{formatNumber(g.cmrWeight, 2)}</TableCell>
                  <TableCell className="num">{formatNumber(g.netWeight, 2)}</TableCell>
                  <TableCell className="num text-amber-700">
                    {formatNumber(g.weightDiff, 2)}
                  </TableCell>
                  <TableCell className="num">{formatCurrency(g.pricePerUnit, g.currency)}</TableCell>
                  <TableCell className="num font-semibold">
                    {formatCurrency(g.totalPrice, g.currency)}
                  </TableCell>
                  <TableCell className="num">{formatCurrency(g.balance, g.currency)}</TableCell>
                  <TableCell className="num">{g.currency || 'USD'}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{g.status || '-'}</Badge>
                  </TableCell>
                  <TableCell>{g.notes || '-'}</TableCell>
                  <TableCell>
                    <RecordActions
                      title="وارده جنسی"
                      detailHref={`/dashboard/goods-arrivals/${g.id}`}
                      row={{
                        number: g.number,
                        dateJalali: g.dateJalali,
                        supplier: g.supplier,
                        location: g.location,
                        cmrNumber: g.cmrNumber,
                        netWeight: g.netWeight,
                        totalPrice: g.totalPrice,
                      }}
                      fields={[
                        { key: 'number', label: 'شماره' },
                        { key: 'dateJalali', label: 'تاریخ' },
                        { key: 'supplier', label: 'فروشنده' },
                        { key: 'location', label: 'محل' },
                        { key: 'cmrNumber', label: 'CMR' },
                        { key: 'netWeight', label: 'وزن خالص' },
                        { key: 'totalPrice', label: 'مبلغ کل' },
                      ]}
                      onSave={(next) => {
                        setItems((prev) =>
                          prev.map((r) =>
                            r.id === g.id
                              ? {
                                  ...r,
                                  number: String(next.number ?? r.number),
                                  dateJalali: String(next.dateJalali ?? r.dateJalali),
                                  supplier: String(next.supplier ?? r.supplier),
                                  location: String(next.location ?? r.location),
                                  cmrNumber: String(next.cmrNumber ?? r.cmrNumber),
                                  netWeight: Number(next.netWeight ?? r.netWeight),
                                  totalPrice: Number(next.totalPrice ?? r.totalPrice),
                                }
                              : r
                          )
                        );
                      }}
                      onDelete={() => setItems((prev) => prev.filter((r) => r.id !== g.id))}
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
                <p className="py-10 text-center text-sm text-slate-500">هنوز محموله ثبت نشده است</p>
              ) : (
                rows.map((g) => (
                  <MobileRecordCard
                    key={g.id}
                    title={g.number}
                    subtitle={`${g.supplier} · ${g.dateJalali}`}
                    badge={<Badge variant="muted">{g.status || g.location}</Badge>}
                    metrics={[
                      { label: 'هزینه کل', value: formatCurrency(g.totalPrice, g.currency) },
                      { label: 'مقدار خالص', value: formatNumber(g.netWeight, 2) },
                      { label: 'وضعیت تسویه', value: formatCurrency(g.balance, g.currency) },
                      { label: 'قرارداد', value: g.contractNumber },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="شرکت بارکننده" value={g.loaderCompany || '-'} />
                        <ExtraRow label="کالا" value={g.product || '-'} />
                        <ExtraRow label="واگن" value={g.wagonNumber} />
                        <ExtraRow label="Railway Carriage" value={g.railwayCarriageNo || '-'} />
                        <ExtraRow label="Description" value={g.description || '-'} />
                        <ExtraRow label="CMR" value={g.cmrNumber} />
                        <ExtraRow label="مسیر" value={g.route || '-'} />
                        <ExtraRow label="ارز" value={g.currency || 'USD'} />
                        <ExtraRow label="ملاحظات" value={g.notes || '-'} />
                      </>
                    }
                    footer={
                      <RecordActions
                        layout="buttons"
                        title="وارده جنسی"
                        detailHref={`/dashboard/goods-arrivals/${g.id}`}
                        row={{
                          number: g.number,
                          dateJalali: g.dateJalali,
                          supplier: g.supplier,
                          location: g.location,
                          cmrNumber: g.cmrNumber,
                          netWeight: g.netWeight,
                          totalPrice: g.totalPrice,
                        }}
                        fields={[
                          { key: 'number', label: 'شماره' },
                          { key: 'dateJalali', label: 'تاریخ' },
                          { key: 'supplier', label: 'فروشنده' },
                          { key: 'location', label: 'محل' },
                          { key: 'cmrNumber', label: 'CMR' },
                          { key: 'netWeight', label: 'وزن خالص' },
                          { key: 'totalPrice', label: 'مبلغ کل' },
                        ]}
                        onSave={(next) => {
                          setItems((prev) =>
                            prev.map((r) =>
                              r.id === g.id
                                ? {
                                    ...r,
                                    number: String(next.number ?? r.number),
                                    dateJalali: String(next.dateJalali ?? r.dateJalali),
                                    supplier: String(next.supplier ?? r.supplier),
                                    location: String(next.location ?? r.location),
                                    cmrNumber: String(next.cmrNumber ?? r.cmrNumber),
                                    netWeight: Number(next.netWeight ?? r.netWeight),
                                    totalPrice: Number(next.totalPrice ?? r.totalPrice),
                                  }
                                : r
                            )
                          );
                        }}
                        onDelete={() => setItems((prev) => prev.filter((r) => r.id !== g.id))}
                      />
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
