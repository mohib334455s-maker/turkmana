'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { jalaliFromIso } from '@/lib/customer-resale';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { balanceClass, formatCurrency, formatNumber } from '@/lib/utils';

export default function SalesResalesPage() {
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const rows = useOpsStore((s) => s.goodsResales).filter((r) => matchesCompany(r.company, company));
  const profit = rows.reduce((s, r) => s + r.totalProfit, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tx('فروش مجدد از موجودی مشتری', 'Customer-stock resales')}
        description={tx(
          'وقتی کالا به مشتری فروخته شده و بعد بخشی از همان جنس به نرخ دیگر به شخص دیگر فروخته می‌شود.',
          'When goods already sold to a customer are taken back and sold to someone else at a new rate.'
        )}
        actions={<CompanySwitcher />}
      />

      <Card className="rounded-[22px]">
        <CardContent className="p-4">
          <p className="text-xs text-slate-500">{tx('سود / ضرر ثبت‌شده', 'Recorded profit / loss')}</p>
          <p className={`mt-1 text-2xl font-extrabold num ${balanceClass(profit)}`}>{formatCurrency(profit)}</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[22px]">
        <ResponsiveData
          table={
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tx('تاریخ', 'Date')}</TableHead>
                    <TableHead>{tx('از مشتری', 'From')}</TableHead>
                    <TableHead>{tx('به مشتری', 'To')}</TableHead>
                    <TableHead>{tx('جنس', 'Product')}</TableHead>
                    <TableHead>{tx('مقدار', 'Qty')}</TableHead>
                    <TableHead>{tx('نرخ قبلی', 'Old rate')}</TableHead>
                    <TableHead>{tx('نرخ جدید', 'New rate')}</TableHead>
                    <TableHead>{tx('سود', 'Profit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-10 text-center text-sm text-slate-500">
                        {tx(
                          'هنوز فروش مجددی نیست. از صفحه مشتری «فروش مجدد» را بزنید.',
                          'No resales yet. Use Resale on a customer page.'
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="num">{jalaliFromIso(r.date)}</TableCell>
                        <TableCell>
                          <Link href={`/dashboard/customers/${r.sourceCustomerId}`} className="text-[var(--brand)] hover:underline">
                            {r.sourceCustomerName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/customers/${r.targetCustomerId}`} className="text-[var(--brand)] hover:underline">
                            {r.targetCustomerName}
                          </Link>
                        </TableCell>
                        <TableCell>{r.productName}</TableCell>
                        <TableCell className="num">
                          {formatNumber(r.qty, 3)} {r.unit}
                        </TableCell>
                        <TableCell className="num">{formatCurrency(r.sourceUnitPrice)}</TableCell>
                        <TableCell className="num">{formatCurrency(r.resaleUnitPrice)}</TableCell>
                        <TableCell className={`num font-semibold ${balanceClass(r.totalProfit)}`}>
                          {formatCurrency(r.totalProfit)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          }
          cards={
            rows.length === 0
              ? [
                  <p key="empty" className="py-10 text-center text-sm text-slate-500">
                    {tx('هنوز فروش مجددی نیست.', 'No resales yet.')}
                  </p>,
                ]
              : rows.map((r) => (
                  <MobileRecordCard
                    key={r.id}
                    title={`${r.sourceCustomerName} → ${r.targetCustomerName}`}
                    subtitle={`${jalaliFromIso(r.date)} · ${r.productName}`}
                    metrics={[
                      { label: tx('مقدار', 'Qty'), value: `${formatNumber(r.qty, 3)} ${r.unit}` },
                      { label: tx('سود', 'Profit'), value: formatCurrency(r.totalProfit) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={tx('نرخ قبلی', 'Old rate')} value={formatCurrency(r.sourceUnitPrice)} />
                        <ExtraRow label={tx('نرخ جدید', 'New rate')} value={formatCurrency(r.resaleUnitPrice)} />
                      </>
                    }
                  />
                ))
          }
        />
      </Card>
    </div>
  );
}
