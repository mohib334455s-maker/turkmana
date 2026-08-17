'use client';

import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { runningBalances, type ExpenseEntry } from '@/lib/expense-ledger';
import { jalaliFromIso } from '@/lib/customer-resale';
import { balanceClass, formatCurrency, formatNumber } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

export function ExpenseLedgerTable({
  rows,
  showGoodsCols = true,
}: {
  rows: ExpenseEntry[];
  showGoodsCols?: boolean;
}) {
  const { tx } = useI18n();
  const withBal = runningBalances(rows);

  if (withBal.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-slate-500">
        {tx('هنوز قلم مصرفی ثبت نشده است', 'No expense lines yet')}
      </p>
    );
  }

  return (
    <ResponsiveData
      table={
        <div className="table-scroll table-scroll-wide">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>طرف حساب</TableHead>
                <TableHead>تفصیلات</TableHead>
                {showGoodsCols ? (
                  <>
                    <TableHead>نوعیت جنس</TableHead>
                    <TableHead>اسم جنس</TableHead>
                    <TableHead>لیتر فی بوتل</TableHead>
                    <TableHead>بوتل فی کارتن</TableHead>
                    <TableHead>پارتی</TableHead>
                  </>
                ) : null}
                <TableHead>نوعیت مصرف</TableHead>
                <TableHead>محل</TableHead>
                <TableHead>گرفت</TableHead>
                <TableHead>داد</TableHead>
                <TableHead>بیلانس</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withBal.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="num">{r.id}</TableCell>
                  <TableCell className="num">{jalaliFromIso(r.date)}</TableCell>
                  <TableCell>{r.counterparty}</TableCell>
                  <TableCell className="max-w-[220px] whitespace-normal">{r.details}</TableCell>
                  {showGoodsCols ? (
                    <>
                      <TableCell>{r.productType || '-'}</TableCell>
                      <TableCell>{r.productName || '-'}</TableCell>
                      <TableCell className="num">{formatNumber(r.litersPerBottle || 0, 0)}</TableCell>
                      <TableCell className="num">{formatNumber(r.bottlesPerCarton || 0, 0)}</TableCell>
                      <TableCell>
                        {r.partyId ? (
                          <Link href={`/dashboard/parties/${r.partyId}`} className="text-[var(--brand)] hover:underline">
                            {r.partyLabel || r.partyId}
                          </Link>
                        ) : (
                          r.partyLabel || '-'
                        )}
                      </TableCell>
                    </>
                  ) : null}
                  <TableCell>{r.expenseType}</TableCell>
                  <TableCell>{r.location || '-'}</TableCell>
                  <TableCell className="num">{r.taken ? formatCurrency(r.taken) : '-'}</TableCell>
                  <TableCell className="num">{r.given ? formatCurrency(r.given) : '-'}</TableCell>
                  <TableCell className={`num font-semibold ${balanceClass(r.balance)}`}>
                    {formatCurrency(r.balance)}
                  </TableCell>
                  <TableCell>{r.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      }
      cards={withBal.map((r) => (
        <MobileRecordCard
          key={r.id}
          title={r.counterparty}
          subtitle={`${jalaliFromIso(r.date)} · ${r.expenseType}`}
          metrics={[
            { label: tx('گرفت', 'Taken'), value: r.taken ? formatCurrency(r.taken) : '-' },
            { label: tx('داد', 'Given'), value: r.given ? formatCurrency(r.given) : '-' },
            {
              label: tx('بیلانس', 'Balance'),
              value: <span className={balanceClass(r.balance)}>{formatCurrency(r.balance)}</span>,
            },
          ]}
          extra={
            <>
              <ExtraRow label={tx('تفصیلات', 'Details')} value={r.details} />
              {showGoodsCols ? <ExtraRow label={tx('پارتی', 'Party')} value={r.partyLabel || '-'} /> : null}
              <ExtraRow label={tx('محل', 'Location')} value={r.location || '-'} />
            </>
          }
        />
      ))}
    />
  );
}
