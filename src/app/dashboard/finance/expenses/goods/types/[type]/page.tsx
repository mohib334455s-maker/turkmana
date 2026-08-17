'use client';

import { use, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpensePageBar } from '@/components/expenses/expense-page-bar';
import { ExpenseEntryDialog } from '@/components/expenses/expense-dialogs';
import { ExpenseLedgerTable } from '@/components/expenses/expense-ledger-table';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { decodeExpenseType, entryNet } from '@/lib/expense-ledger';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';

export default function GoodsExpenseTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: rawType } = use(params);
  const type = decodeExpenseType(rawType);
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const entries = useOpsStore((s) => s.expenseEntries);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      entries.filter(
        (e) => e.book === 'goods' && e.expenseType === type && matchesCompany(e.company, company)
      ),
    [entries, type, company]
  );
  const net = rows.reduce((s, e) => s + entryNet(e), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <ExpensePageBar
        title={`${tx('مصارف بالای اجناس', 'Expenses on goods')} — ${type}`}
        balance={net}
        backHref="/dashboard/finance/expenses/goods"
        backLabel={tx('برگشت به صفحه', 'Back to page')}
        actions={
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            {tx('ثبت پرداخت', 'Add payment')}
          </Button>
        }
      />
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <ExpenseLedgerTable rows={rows} />
      </div>
      <ExpenseEntryDialog open={open} onClose={() => setOpen(false)} defaultBook="goods" />
    </div>
  );
}
