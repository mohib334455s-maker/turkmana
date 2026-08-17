import type { CompanyKey } from '@/lib/demo-data';

export type ExpenseBookCode =
  | 'bank_commission'
  | 'balance_expenses'
  | 'duplicate_tariffs'
  | 'misc'
  | 'goods';

export type ExpenseBookKind = 'company' | 'goods';

export type ExpenseBook = {
  code: ExpenseBookCode;
  fa: string;
  en: string;
  kind: ExpenseBookKind;
};

/** Top-level مصارف rows matching the employer summary sheet. */
export const EXPENSE_BOOKS: ExpenseBook[] = [
  { code: 'bank_commission', fa: 'کمیشن بانکی', en: 'Bank commission', kind: 'company' },
  { code: 'balance_expenses', fa: 'مصارف بیلانس', en: 'Balance expenses', kind: 'company' },
  {
    code: 'duplicate_tariffs',
    fa: 'تعرفه‌های تکراری و مصارف قابل مجرایی',
    en: 'Duplicate tariffs and deductible expenses',
    kind: 'company',
  },
  { code: 'misc', fa: 'مصارف متفرقه', en: 'Company miscellaneous', kind: 'company' },
  { code: 'goods', fa: 'مصارف بالای اجناس', en: 'Expenses on goods', kind: 'goods' },
];

export const GOODS_EXPENSE_TYPES = [
  'ترانسپورت داخلی',
  'ترانسپورت خارجی',
  'محصولی',
  'محصولی و لیتری',
  'خاک پولی',
  'مصارف متفرقه',
  'راه‌آهن',
  'کرایه موتر',
  'گمرک',
  'تلکس',
  'خدمات مواد نفتی',
  'لابراتوار',
  'جریمه توقف',
  'خدمات بندری',
  'ذخیره',
  'کمیسیون لیتری',
  'حق‌الوزن',
  'مصارف دولتی',
  'مصارف قرارداد',
  'مصارف دفتر',
] as const;

export type ExpenseAccount = {
  id: number;
  code: string;
  name: string;
  category: string;
  productCode: string;
  productName: string;
  contractId?: number;
  contractNumber: string;
  partyId?: number;
  partyNumber: string;
  company: CompanyKey;
  notes: string;
};

export type ExpenseEntry = {
  id: number;
  book: ExpenseBookCode;
  accountId?: number;
  date: string;
  counterparty: string;
  details: string;
  productType: string;
  productName: string;
  litersPerBottle: number;
  bottlesPerCarton: number;
  partyLabel: string;
  partyId?: number;
  contractId?: number;
  expenseType: string;
  taken: number;
  given: number;
  location: string;
  status: string;
  notes: string;
  company: CompanyKey;
};

export function bookByCode(code: string): ExpenseBook | undefined {
  return EXPENSE_BOOKS.find((b) => b.code === code);
}

export function entryNet(row: Pick<ExpenseEntry, 'taken' | 'given'>) {
  return Number(row.given || 0) - Number(row.taken || 0);
}

export function runningBalances(rows: ExpenseEntry[]) {
  const sorted = [...rows].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.id - b.id;
  });
  let bal = 0;
  return sorted.map((row) => {
    bal += entryNet(row);
    return { ...row, balance: bal };
  });
}

export function sumByExpenseType(rows: ExpenseEntry[]) {
  const map = new Map<string, { type: string; taken: number; given: number; net: number; count: number }>();
  for (const row of rows) {
    const type = row.expenseType || 'سایر';
    const prev = map.get(type) ?? { type, taken: 0, given: 0, net: 0, count: 0 };
    prev.taken += Number(row.taken || 0);
    prev.given += Number(row.given || 0);
    prev.net += entryNet(row);
    prev.count += 1;
    map.set(type, prev);
  }
  return [...map.values()].sort((a, b) => a.type.localeCompare(b.type, 'fa'));
}

export function encodeExpenseType(type: string) {
  return encodeURIComponent(type);
}

export function decodeExpenseType(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
