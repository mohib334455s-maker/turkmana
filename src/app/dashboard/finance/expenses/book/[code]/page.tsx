'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { ExpensePageBar, ExpenseBalanceLink } from '@/components/expenses/expense-page-bar';
import { ExpenseEntryDialog } from '@/components/expenses/expense-dialogs';
import { ExpenseLedgerTable } from '@/components/expenses/expense-ledger-table';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import {
  bookByCode,
  encodeExpenseType,
  entryNet,
  sumByExpenseType,
  type ExpenseBookCode,
} from '@/lib/expense-ledger';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { formatCurrency } from '@/lib/utils';

export default function ExpenseBookPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const book = bookByCode(code);
  const entries = useOpsStore((s) => s.expenseEntries);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      entries.filter(
        (e) => e.book === code && matchesCompany(e.company, company)
      ),
    [entries, code, company]
  );

  const types = sumByExpenseType(rows);
  const net = rows.reduce((s, e) => s + entryNet(e), 0);

  if (!book) {
    return (
      <div className="space-y-3">
        <p>{tx('دفتر مصرف یافت نشد.', 'Expense book not found.')}</p>
        <Link href="/dashboard/finance/expenses">
          <Button variant="outline">{tx('بازگشت', 'Back')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ExpensePageBar
        title={tx(book.fa, book.en)}
        balance={net}
        actions={
          <>
            <CompanySwitcher />
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              {tx('ثبت پرداخت', 'Add payment')}
            </Button>
          </>
        }
      />

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold">{tx('عمومیات مصارف', 'Expense totals by type')}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {tx(
              'روی مبلغ کلیک کنید تا ببینید در کدام تاریخ و با چه جزئیاتی پرداخت شده — حتی اگر ده قلم باشد.',
              'Click a total to see each payment date and details — even if it was split into ten lines.'
            )}
          </p>
        </div>
        {types.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            {tx('پرداختی برای این دفتر ثبت نشده است.', 'No payments in this book yet.')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NO</TableHead>
                <TableHead>{tx('نوعیت', 'Type')}</TableHead>
                <TableHead>{tx('تعداد قلم', 'Lines')}</TableHead>
                <TableHead>{tx('بیلانس', 'Balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((row, i) => (
                <TableRow key={row.type}>
                  <TableCell className="num">{i + 1}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell className="num">{row.count}</TableCell>
                  <TableCell>
                    <ExpenseBalanceLink
                      href={`/dashboard/finance/expenses/book/${code}/types/${encodeExpenseType(row.type)}`}
                      amount={row.net}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-50 font-bold">
                <TableCell />
                <TableCell>{tx('جمله شد', 'Total')}</TableCell>
                <TableCell />
                <TableCell className="num">{formatCurrency(net)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}
      </section>

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold">{tx('همه پرداخت‌ها', 'All payments')}</h2>
        </div>
        <ExpenseLedgerTable rows={rows} showGoodsCols={book.kind === 'goods'} />
      </section>

      <ExpenseEntryDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultBook={code as ExpenseBookCode}
      />
    </div>
  );
}
