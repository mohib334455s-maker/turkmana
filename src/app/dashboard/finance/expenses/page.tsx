'use client';

import { useMemo, useState } from 'react';
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
import { PageHeader } from '@/components/shared/page-header';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { ExpenseBalanceLink } from '@/components/expenses/expense-page-bar';
import { ExpenseAccountDialog, ExpenseEntryDialog } from '@/components/expenses/expense-dialogs';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { EXPENSE_BOOKS, entryNet } from '@/lib/expense-ledger';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { formatCurrency } from '@/lib/utils';

export default function ExpensesHubPage() {
  const { t, tx } = useI18n();
  const { company } = useCompanyStore();
  const entries = useOpsStore((s) => s.expenseEntries);
  const [entryOpen, setEntryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const filtered = useMemo(
    () => entries.filter((e) => matchesCompany(e.company, company)),
    [entries, company]
  );

  const rows = EXPENSE_BOOKS.map((book, i) => {
    const bookRows = filtered.filter((e) => e.book === book.code);
    const net = bookRows.reduce((s, e) => s + entryNet(e), 0);
    const href =
      book.code === 'goods'
        ? '/dashboard/finance/expenses/goods'
        : `/dashboard/finance/expenses/book/${book.code}`;
    return { ...book, no: i + 1, net, count: bookRows.length, href };
  });

  const total = rows.reduce((s, r) => s + r.net, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageExpenses')}
        description={tx(
          'دو نوع اصلی: مصارف متفرقه شرکت، و مصارف بالای اجناس. جمع هر ردیف قابل کلیک است تا جزئیات پرداخت‌ها بیاید.',
          'Two main kinds: company miscellaneous, and landed costs on goods. Click a total to see the payment lines.'
        )}
        actions={
          <>
            <CompanySwitcher />
            <Button type="button" variant="outline" onClick={() => setAccountOpen(true)}>
              {tx('حساب مصرف جنس', 'Goods account')}
            </Button>
            <Button type="button" onClick={() => setEntryOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              {tx('ثبت مصرف', 'Record expense')}
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="bg-[#1e3a5f] px-4 py-3 text-center text-lg font-bold text-white">
          {tx('مصارف', 'Expenses')}
        </div>
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">NO</TableHead>
                <TableHead>{tx('نوعیت', 'Type')}</TableHead>
                <TableHead>{tx('بیلانس', 'Balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.code}>
                  <TableCell className="num">{r.no}</TableCell>
                  <TableCell>
                    <Link href={r.href} className="font-medium hover:text-[var(--brand)]">
                      {tx(r.fa, r.en)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <ExpenseBalanceLink href={r.href} amount={r.net} empty={r.count === 0} />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-slate-50 font-bold">
                <TableCell />
                <TableCell>{tx('جمله شد', 'Total')}</TableCell>
                <TableCell className="num">{formatCurrency(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
      </div>

      <p className="text-sm leading-relaxed text-slate-500">
        {tx(
          'مصارف متفرقه هزینه‌های خود شرکت است. مصارف بالای اجناس به پارتی / قرارداد / جنس وصل می‌شود تا بهای تمام‌شده همان محموله درست شود.',
          'Miscellaneous is company overhead. Expenses on goods attach to a party, contract, or product so landed cost of that shipment is correct.'
        )}
      </p>

      <ExpenseEntryDialog open={entryOpen} onClose={() => setEntryOpen(false)} />
      <ExpenseAccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}
