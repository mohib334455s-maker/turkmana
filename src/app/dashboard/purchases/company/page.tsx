'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { companyPurchases, contracts } from '@/lib/demo-data';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { BiLabel } from '@/components/shared/bi-label';

function contractHref(contractNumber: string) {
  const found = contracts.find((c) => c.number === contractNumber);
  return found ? `/dashboard/contracts/${found.id}` : '/dashboard/contracts';
}
export default function CompanyPurchasesPage() {
  const { company } = useCompanyStore();
  const rows = companyPurchases.filter((p) => matchesCompany(p.company, company));

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          amount: acc.amount + r.amount,
          paid: acc.paid + r.paid,
          balance: acc.balance + r.balance,
        }),
        { amount: 0, paid: 0, balance: 0 }
      ),
    [rows]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="خریداری‌های شرکت"
        description="خریدهای شرکت — فروشنده، قرارداد، مقدار، نرخ، هزینه‌ها و وضعیت پرداخت/دریافت"
        actions={
          <>
            <ExportButtons
              filename="company-purchases"
              title="خریداری‌های شرکت"
              columns={[
                { key: 'number', label: 'شماره' },
                { key: 'dateJalali', label: 'تاریخ' },
                { key: 'seller', label: 'فروشنده' },
                { key: 'contract', label: 'قرارداد' },
                { key: 'product', label: 'نوع جنس' },
                { key: 'location', label: 'محل' },
                { key: 'qty', label: 'مقدار' },
                { key: 'unit', label: 'واحد' },
                { key: 'rate', label: 'نرخ' },
                { key: 'amount', label: 'مبلغ' },
                { key: 'currency', label: 'ارز' },
                { key: 'freight', label: 'هزینه حمل' },
                { key: 'otherCosts', label: 'سایر مصارف' },
                { key: 'paid', label: 'پرداخت‌شده' },
                { key: 'balance', label: 'باقی‌مانده' },
                { key: 'payStatus', label: 'وضعیت پرداخت' },
                { key: 'goodsStatus', label: 'وضعیت دریافت' },
                { key: 'notes', label: 'ملاحظات' },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
          </>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">لیست خریداری‌های شرکت</CardTitle>
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
                      <TableHead><BiLabel fa="فروشنده" en="Seller" /></TableHead>
                      <TableHead><BiLabel fa="قرارداد" en="Contract" /></TableHead>
                      <TableHead><BiLabel fa="نوع جنس" en="Product" /></TableHead>
                      <TableHead><BiLabel fa="محل" en="Location" /></TableHead>
                      <TableHead><BiLabel fa="مقدار" en="Qty" /></TableHead>
                      <TableHead><BiLabel fa="واحد" en="Unit" /></TableHead>
                      <TableHead><BiLabel fa="نرخ خرید" en="Rate" /></TableHead>
                      <TableHead><BiLabel fa="مبلغ" en="Amount" /></TableHead>
                      <TableHead><BiLabel fa="ارز" en="Currency" /></TableHead>
                      <TableHead><BiLabel fa="هزینه حمل" en="Freight" /></TableHead>
                      <TableHead><BiLabel fa="سایر مصارف" en="Other costs" /></TableHead>
                      <TableHead><BiLabel fa="پرداخت‌شده" en="Paid" /></TableHead>
                      <TableHead><BiLabel fa="باقی‌مانده" en="Balance" /></TableHead>
                      <TableHead><BiLabel fa="وضعیت پرداخت" en="Pay status" /></TableHead>
                      <TableHead><BiLabel fa="وضعیت دریافت جنس" en="Goods status" /></TableHead>
                      <TableHead><BiLabel fa="ملاحظات" en="Notes" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty colSpan={18} message="هنوز خریداری ثبت نشده است" />
                    ) : null}
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-semibold num">{r.number}</TableCell>
                        <TableCell className="num">{r.dateJalali}</TableCell>
                        <TableCell>{r.seller}</TableCell>
                        <TableCell>
                          <Link
                            href={contractHref(r.contract)}
                            className="text-[var(--brand)] hover:underline num"
                          >
                            {r.contract}
                          </Link>
                        </TableCell>
                        <TableCell>{r.product}</TableCell>
                        <TableCell>{r.location}</TableCell>
                        <TableCell className="num">{formatNumber(r.qty, 0)}</TableCell>
                        <TableCell>{r.unit}</TableCell>
                        <TableCell className="num">{formatCurrency(r.rate, r.currency)}</TableCell>
                        <TableCell className="num font-semibold">
                          {formatCurrency(r.amount, r.currency)}
                        </TableCell>
                        <TableCell className="num">{r.currency}</TableCell>
                        <TableCell className="num">{formatCurrency(r.freight, r.currency)}</TableCell>
                        <TableCell className="num">{formatCurrency(r.otherCosts, r.currency)}</TableCell>
                        <TableCell className="num text-emerald-700">
                          {formatCurrency(r.paid, r.currency)}
                        </TableCell>
                        <TableCell className="num text-amber-700 font-semibold">
                          {formatCurrency(r.balance, r.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="muted">{r.payStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="info">{r.goodsStatus}</Badge>
                        </TableCell>
                        <TableCell>{r.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                    {rows.length > 0 ? (
                      <TableRow className="bg-slate-50 font-semibold">
                        <TableCell colSpan={9}>جمع</TableCell>
                        <TableCell className="num">{formatCurrency(totals.amount)}</TableCell>
                        <TableCell colSpan={3} />
                        <TableCell className="num text-emerald-700">
                          {formatCurrency(totals.paid)}
                        </TableCell>
                        <TableCell className="num text-amber-700">
                          {formatCurrency(totals.balance)}
                        </TableCell>
                        <TableCell colSpan={3} />
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">هنوز خریداری ثبت نشده است</p>
              ) : (
                <>
                  {rows.map((r) => (
                    <MobileRecordCard
                      key={r.id}
                      title={r.number}
                      subtitle={`${r.seller} · ${r.dateJalali}`}
                      badge={<Badge variant="muted">{r.payStatus}</Badge>}
                      metrics={[
                        { label: 'مبلغ', value: formatCurrency(r.amount, r.currency) },
                        { label: 'پرداخت‌شده', value: formatCurrency(r.paid, r.currency) },
                        { label: 'باقی‌مانده', value: formatCurrency(r.balance, r.currency) },
                        { label: 'مقدار', value: `${formatNumber(r.qty, 0)} ${r.unit}` },
                      ]}
                      extra={
                        <>
                          <ExtraRow label="قرارداد" value={r.contract} />
                          <ExtraRow label="نوع جنس" value={r.product} />
                          <ExtraRow label="محل" value={r.location} />
                          <ExtraRow label="نرخ" value={formatCurrency(r.rate, r.currency)} />
                          <ExtraRow label="حمل" value={formatCurrency(r.freight, r.currency)} />
                          <ExtraRow label="سایر" value={formatCurrency(r.otherCosts, r.currency)} />
                          <ExtraRow label="دریافت" value={r.goodsStatus} />
                          <ExtraRow label="ملاحظات" value={r.notes || '-'} />
                        </>
                      }
                    />
                  ))}
                  <Card>
                    <CardContent className="grid grid-cols-3 gap-2 p-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">جمع مبلغ</p>
                        <p className="font-bold num">{formatCurrency(totals.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">جمع پرداخت</p>
                        <p className="font-bold num text-emerald-700">{formatCurrency(totals.paid)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">جمع باقی</p>
                        <p className="font-bold num text-amber-700">{formatCurrency(totals.balance)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
