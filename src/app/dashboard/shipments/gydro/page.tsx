'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
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
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { cmrShipments } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'muted' | 'danger'> = {
  تخلیه: 'success',
  در_راه: 'warning',
  ترانزیت: 'info',
  فروش: 'muted',
  بسته: 'danger',
};

export default function DieselGydroPage() {
  const { company } = useCompanyStore();
  const [year, setYear] = useState('all');
  const [location, setLocation] = useState('all');
  const [product, setProduct] = useState('all');
  const [contract, setContract] = useState('all');
  const [status, setStatus] = useState('all');

  const base = useMemo(
    () => cmrShipments.filter((s) => s.isGydro && matchesCompany(s.company, company)),
    [company]
  );

  const years = useMemo(() => [...new Set(base.map((s) => s.year))].sort((a, b) => b - a), [base]);
  const locations = useMemo(() => [...new Set(base.map((s) => s.location))], [base]);
  const products = useMemo(() => [...new Set(base.map((s) => s.product))], [base]);
  const contracts = useMemo(() => [...new Set(base.map((s) => s.contractNumber))], [base]);
  const statuses = useMemo(() => [...new Set(base.map((s) => s.status))], [base]);

  const rows = base.filter((s) => {
    if (year !== 'all' && String(s.year) !== year) return false;
    if (location !== 'all' && s.location !== location) return false;
    if (product !== 'all' && s.product !== product) return false;
    if (contract !== 'all' && s.contractNumber !== contract) return false;
    if (status !== 'all' && s.status !== status) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="دیزل گیدرو / ثبت محموله سالانه"
        description="محموله‌های CMR دیزل گیدرو — فیلتر سال، محل، کالا، قرارداد و وضعیت"
        actions={
          <>
            <ExportButtons
              filename="diesel-gydro"
              title="دیزل گیدرو"
              columns={[
                { key: 'number', label: 'شماره' },
                { key: 'dateJalali', label: 'تاریخ' },
                { key: 'loaderCompany', label: 'شرکت بارکننده' },
                { key: 'wagonNumber', label: 'شماره واگن' },
                { key: 'location', label: 'محل' },
                { key: 'railwayCarriageNo', label: 'Railway Carriage No' },
                { key: 'description', label: 'Description' },
                { key: 'cmrWeight', label: 'CMR Weight' },
                { key: 'netWeight', label: 'Net Weight' },
                { key: 'weightDiff', label: 'CMR-NW' },
                { key: 'balance', label: 'Balance' },
                { key: 'pricePerTon', label: 'Price/Ton' },
                { key: 'totalPrice', label: 'Total Price' },
                { key: 'status', label: 'وضعیت' },
                { key: 'contractNumber', label: 'قرارداد' },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
          </>
        }
      />

      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="all">همه سال‌ها</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <Select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="all">همه محل‌ها</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
          <Select value={product} onChange={(e) => setProduct(e.target.value)}>
            <option value="all">همه کالاها</option>
            {products.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
          <Select value={contract} onChange={(e) => setContract(e.target.value)}>
            <option value="all">همه قراردادها</option>
            {contracts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">همه وضعیت‌ها</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">محموله‌های دیزل گیدرو</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><BiLabel fa="شماره" en="No." /></TableHead>
                      <TableHead><BiLabel fa="تاریخ" en="Date" /></TableHead>
                      <TableHead><BiLabel fa="شرکت بارکننده" en="Loader" /></TableHead>
                      <TableHead><BiLabel fa="شماره واگن" en="Wagon no." /></TableHead>
                      <TableHead><BiLabel fa="محل" en="Location" /></TableHead>
                      <TableHead><BiLabel fa="شماره واگن ریل" en="Railway carriage" /></TableHead>
                      <TableHead><BiLabel fa="توضیحات" en="Description" /></TableHead>
                      <TableHead><BiLabel fa="وزن CMR" en="CMR weight" /></TableHead>
                      <TableHead><BiLabel fa="وزن خالص" en="Net weight" /></TableHead>
                      <TableHead><BiLabel fa="تفاوت CMR و خالص" en="CMR − NW" /></TableHead>
                      <TableHead><BiLabel fa="بیلانس" en="Balance" /></TableHead>
                      <TableHead><BiLabel fa="قیمت فی تن" en="Price / ton" /></TableHead>
                      <TableHead><BiLabel fa="قیمت مجموع" en="Total price" /></TableHead>
                      <TableHead><BiLabel fa="وضعیت محموله" en="Status" /></TableHead>
                      <TableHead><BiLabel fa="قرارداد" en="Contract" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty colSpan={15} message="محموله گیدرو یافت نشد" />
                    ) : null}
                    {rows.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-semibold num">{s.number}</TableCell>
                        <TableCell className="num">{s.dateJalali}</TableCell>
                        <TableCell>{s.loaderCompany}</TableCell>
                        <TableCell className="num">{s.wagonNumber}</TableCell>
                        <TableCell>{s.location}</TableCell>
                        <TableCell className="num">{s.railwayCarriageNo}</TableCell>
                        <TableCell className="max-w-[180px] whitespace-normal">{s.description}</TableCell>
                        <TableCell className="num">{formatNumber(s.cmrWeight, 2)}</TableCell>
                        <TableCell className="num">{formatNumber(s.netWeight, 2)}</TableCell>
                        <TableCell className="num text-amber-700">{formatNumber(s.weightDiff, 2)}</TableCell>
                        <TableCell className="num">{formatNumber(s.balance, 2)}</TableCell>
                        <TableCell className="num">{formatCurrency(s.pricePerTon, s.currency)}</TableCell>
                        <TableCell className="num font-semibold">
                          {formatCurrency(s.totalPrice, s.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[s.status] ?? 'muted'}>{s.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {s.contractId ? (
                            <Link
                              href={`/dashboard/contracts/${s.contractId}`}
                              className="text-[var(--brand)] hover:underline num"
                            >
                              {s.contractNumber}
                            </Link>
                          ) : (
                            <span className="num">{s.contractNumber}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">محموله گیدرو یافت نشد</p>
              ) : (
                rows.map((s) => (
                  <MobileRecordCard
                    key={s.id}
                    title={s.number}
                    subtitle={`${s.loaderCompany} · ${s.dateJalali}`}
                    badge={<Badge variant={statusVariant[s.status] ?? 'muted'}>{s.status}</Badge>}
                    metrics={[
                      { label: 'محل', value: s.location },
                      { label: 'Net Weight', value: formatNumber(s.netWeight, 2) },
                      { label: 'Total Price', value: formatCurrency(s.totalPrice, s.currency) },
                      {
                        label: 'قرارداد',
                        value: s.contractId ? (
                          <Link
                            href={`/dashboard/contracts/${s.contractId}`}
                            className="text-[var(--brand)] hover:underline"
                          >
                            {s.contractNumber}
                          </Link>
                        ) : (
                          s.contractNumber
                        ),
                      },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="واگن" value={s.wagonNumber} />
                        <ExtraRow label="Railway Carriage" value={s.railwayCarriageNo} />
                        <ExtraRow label="Description" value={s.description} />
                        <ExtraRow label="CMR Weight" value={formatNumber(s.cmrWeight, 2)} />
                        <ExtraRow label="CMR-NW" value={formatNumber(s.weightDiff, 2)} />
                        <ExtraRow label="Balance" value={formatNumber(s.balance, 2)} />
                        <ExtraRow label="Price/Ton" value={formatCurrency(s.pricePerTon, s.currency)} />
                      </>
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
