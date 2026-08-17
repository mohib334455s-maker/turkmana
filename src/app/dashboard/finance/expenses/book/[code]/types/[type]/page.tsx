'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpensePageBar } from '@/components/expenses/expense-page-bar';
import { ExpenseEntryDialog } from '@/components/expenses/expense-dialogs';
import { ExpenseLedgerTable } from '@/components/expenses/expense-ledger-table';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import {
  bookByCode,
  decodeExpenseType,
  entryNet,
  type ExpenseBookCode,
} from '@/lib/expense-ledger';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';

export default function ExpenseTypeDetailPage({
  params,
}: {
  params: Promise<{ code: string; type: string }>;
}) {
  const { code, type: rawType } = use(params);
  const type = decodeExpenseType(rawType);
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const book = bookByCode(code);
  const entries = useOpsStore((s) => s.expenseEntries);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      entries.filter(
        (e) =>
          e.book === code &&
          e.expenseType === type &&
          matchesCompany(e.company, company)
      ),
    [entries, code, type, company]
  );

  const net = rows.reduce((s, e) => s + entryNet(e), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <ExpensePageBar
        title={`${book ? tx(book.fa, book.en) : ''} — ${type}`}
        balance={net}
        backHref={`/dashboard/finance/expenses/book/${code}`}
        backLabel={tx('برگشت به صفحه', 'Back to page')}
        actions={
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            {tx('ثبت پرداخت', 'Add payment')}
          </Button>
        }
      />

      <p className="text-sm text-slate-500">
        {tx(
          `${rows.length} قلم پرداخت برای این نوع مصرف.`,
          `${rows.length} payment line(s) for this expense type.`
        )}{' '}
        <Link href={`/dashboard/finance/expenses/book/${code}`} className="text-[var(--brand)] hover:underline">
          {tx('عمومیات', 'Summary')}
        </Link>
      </p>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <ExpenseLedgerTable rows={rows} showGoodsCols={book?.kind === 'goods'} />
      </div>

      <ExpenseEntryDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultBook={(code as ExpenseBookCode) || 'misc'}
      />
    </div>
  );
}
