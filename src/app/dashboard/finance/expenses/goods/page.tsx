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
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { ExpensePageBar, ExpenseBalanceLink } from '@/components/expenses/expense-page-bar';
import { ExpenseAccountDialog, ExpenseEntryDialog } from '@/components/expenses/expense-dialogs';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { encodeExpenseType, entryNet, sumByExpenseType } from '@/lib/expense-ledger';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { formatCurrency } from '@/lib/utils';

export default function GoodsExpensesPage() {
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const entries = useOpsStore((s) => s.expenseEntries);
  const accounts = useOpsStore((s) => s.expenseAccounts);
  const [entryOpen, setEntryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const rows = useMemo(
    () => entries.filter((e) => e.book === 'goods' && matchesCompany(e.company, company)),
    [entries, company]
  );
  const accountRows = useMemo(
    () => accounts.filter((a) => matchesCompany(a.company, company)),
    [accounts, company]
  );

  const types = sumByExpenseType(rows);
  const net = rows.reduce((s, e) => s + entryNet(e), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <ExpensePageBar
        title={tx('مصارف بالای اجناس', 'Expenses on goods')}
        balance={net}
        actions={
          <>
            <CompanySwitcher />
            <Button type="button" variant="secondary" size="sm" onClick={() => setAccountOpen(true)}>
              {tx('حساب جدید', 'New account')}
            </Button>
            <Button type="button" size="sm" onClick={() => setEntryOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              {tx('ثبت مصرف', 'Record expense')}
            </Button>
          </>
        }
      />

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold">{tx('عمومیات مصارف', 'Totals by expense type')}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {tx(
              'مثلاً ترانسپورت داخلی ۲۰۰۰۰ دالر — با کلیک، تمام قلم‌های پرداخت همان دسته باز می‌شود.',
              'Example: domestic transport $20,000 — click to open every payment that makes up that total.'
            )}
          </p>
        </div>
        {types.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            {tx('هنوز مصرف جنسی ثبت نشده است.', 'No goods expenses yet.')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NO</TableHead>
                <TableHead>{tx('نوعیت مصرف', 'Expense type')}</TableHead>
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
                      href={`/dashboard/finance/expenses/goods/types/${encodeExpenseType(row.type)}`}
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
          <h2 className="font-bold">{tx('حساب‌های مصرف جنس', 'Goods expense accounts')}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {tx(
              'مثل مصارف پطرول ۹۲ قرارداد B-035103 — هر حساب دفتر جداگانه دارد.',
              'E.g. Petrol 92 expenses for contract B-035103 — each account has its own ledger.'
            )}
          </p>
        </div>
        {accountRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            {tx('حساب مصرف جنس بسازید (مثلاً مصارف پطرول ۹۲ قرارداد B-035103).', 'Create a goods expense account first.')}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tx('شماره', 'No.')}</TableHead>
                <TableHead>{tx('طرف حساب', 'Account')}</TableHead>
                <TableHead>{tx('کتگوری', 'Category')}</TableHead>
                <TableHead>{tx('بیلانس', 'Balance')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accountRows.map((a, i) => {
                const accRows = rows.filter((e) => e.accountId === a.id);
                const accNet = accRows.reduce((s, e) => s + entryNet(e), 0);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="num">{i + 1}</TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/finance/expenses/goods/accounts/${a.id}`}
                        className="font-medium hover:text-[var(--brand)]"
                      >
                        {a.name}
                        {a.code ? ` ${a.code}` : ''}
                      </Link>
                    </TableCell>
                    <TableCell>{a.category}</TableCell>
                    <TableCell>
                      <ExpenseBalanceLink
                        href={`/dashboard/finance/expenses/goods/accounts/${a.id}`}
                        amount={accNet}
                        empty={accRows.length === 0}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>

      <ExpenseEntryDialog open={entryOpen} onClose={() => setEntryOpen(false)} defaultBook="goods" />
      <ExpenseAccountDialog open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}
