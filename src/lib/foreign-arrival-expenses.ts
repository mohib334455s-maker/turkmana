/** Expense columns for foreign arrivals (وارده خارجی) — defaults + custom keys. */

export type ExpenseColumnDef = {
  key: string;
  label: string;
};

export const DEFAULT_FOREIGN_EXPENSE_COLUMNS: ExpenseColumnDef[] = [
  { key: 'customs', label: 'گمرک' },
  { key: 'transport', label: 'ترانسپورت' },
  { key: 'loading', label: 'بارگیری' },
  { key: 'bank', label: 'کمیشن بانکی' },
  { key: 'storage', label: 'ذخیره' },
  { key: 'fine', label: 'جریمه' },
  { key: 'railway', label: 'راه‌آهن' },
  { key: 'misc', label: 'سایر' },
];

export function normalizeExpenseColumns(
  raw: unknown
): ExpenseColumnDef[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [...DEFAULT_FOREIGN_EXPENSE_COLUMNS];
  }
  const cols = raw
    .map((c) => {
      if (!c || typeof c !== 'object') return null;
      const row = c as Record<string, unknown>;
      const key = String(row.key || '').trim();
      const label = String(row.label || key).trim();
      if (!key) return null;
      return { key, label };
    })
    .filter(Boolean) as ExpenseColumnDef[];
  return cols.length ? cols : [...DEFAULT_FOREIGN_EXPENSE_COLUMNS];
}

export function expenseTotal(
  expenses: Record<string, number> | undefined,
  columns: ExpenseColumnDef[]
) {
  if (!expenses) return 0;
  return columns.reduce((sum, c) => sum + (Number(expenses[c.key]) || 0), 0);
}

export function slugExpenseKey(label: string) {
  const base = label
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 40);
  return base || `exp_${Date.now()}`;
}
