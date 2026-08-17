'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpensePageBar } from '@/components/expenses/expense-page-bar';
import { ExpenseEntryDialog } from '@/components/expenses/expense-dialogs';
import { ExpenseLedgerTable } from '@/components/expenses/expense-ledger-table';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { entryNet } from '@/lib/expense-ledger';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';

export default function GoodsExpenseAccountPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = use(params);
  const id = Number(accountId);
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const account = useOpsStore((s) => s.expenseAccounts.find((a) => a.id === id));
  const entries = useOpsStore((s) => s.expenseEntries);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => entries.filter((e) => e.accountId === id && matchesCompany(e.company, company)),
    [entries, id, company]
  );
  const net = rows.reduce((s, e) => s + entryNet(e), 0);

  if (!account) {
    return (
      <div className="space-y-3">
        <p>{tx('حساب مصرف یافت نشد.', 'Expense account not found.')}</p>
        <Link href="/dashboard/finance/expenses/goods">
          <Button variant="outline">{tx('بازگشت', 'Back')}</Button>
        </Link>
      </div>
    );
  }

  const title =
    account.name +
    (account.code ? ` ${account.code}` : '') +
    (account.contractNumber ? ` ${tx('قرارداد', 'contract')} ${account.contractNumber}` : '');

  return (
    <div className="space-y-6 animate-fade-in">
      <ExpensePageBar
        title={title}
        balance={net}
        backHref="/dashboard/finance/expenses/goods"
        backLabel={tx('برگشت به صفحه', 'Back to page')}
        actions={
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            {tx('ثبت مصرف', 'Record expense')}
          </Button>
        }
      />
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <ExpenseLedgerTable rows={rows} />
      </div>
      <ExpenseEntryDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultBook="goods"
        defaultAccountId={id}
      />
    </div>
  );
}
