import type { CompanyKey } from '@/lib/demo-data';

export type JournalOpType =
  | 'receipt'
  | 'payment'
  | 'purchase'
  | 'sale'
  | 'transfer'
  | 'expense'
  | 'loading'
  | 'unload'
  | 'goods_report'
  | 'loan'
  | 'settlement'
  | 'partner'
  | 'asset'
  | 'depreciation'
  | 'misc_receivable'
  | 'other';

export type JournalApprovalMarks = {
  office: boolean;
  accounting: boolean;
  supervisor: boolean;
  chief: boolean;
};

/** Links a journal line to real accounts / modules. */
export type JournalLinks = {
  customerId?: number;
  supplierId?: number;
  exchangeId?: number;
  contractId?: number;
  partyId?: number;
  warehouseId?: number;
  saleId?: number;
  purchaseId?: number;
  expenseId?: number;
  bankAccountId?: number;
  cashAccountId?: number;
  /** @deprecated prefer bankAccountId */
  bank?: boolean;
  /** @deprecated prefer cashAccountId */
  cash?: boolean;
  /** Chart-of-accounts style links */
  partnerAccountId?: number;
  miscReceivableId?: number;
  assetAccountId?: number;
  depreciationAccountId?: number;
  ledgerAccountId?: number;
};

export type JournalEntryRow = {
  id: number;
  number: string;
  dateJalali: string;
  dateGregorian: string;
  dateIso?: string;
  weekday?: string;
  giver: string;
  receiver: string;
  details: string;
  amount: number;
  currency: string;
  qty: number;
  unit: string;
  opType: JournalOpType | string;
  status: string;
  company: CompanyKey;
  /** Sort order within the day (lower = earlier). */
  lineOrder?: number;
  links?: JournalLinks;
  marks?: JournalApprovalMarks;
};

export const JOURNAL_OP_LABELS: Record<string, { fa: string; en: string }> = {
  receipt: { fa: 'دریافت', en: 'Receipt' },
  payment: { fa: 'پرداخت', en: 'Payment' },
  purchase: { fa: 'خرید', en: 'Purchase' },
  sale: { fa: 'فروش', en: 'Sale' },
  transfer: { fa: 'انتقال', en: 'Transfer' },
  expense: { fa: 'مصارف', en: 'Expense' },
  loading: { fa: 'بارگیری', en: 'Loading' },
  unload: { fa: 'تخلیه', en: 'Unload' },
  goods_report: { fa: 'راپور جنسی', en: 'Goods report' },
  loan: { fa: 'قرضه', en: 'Loan' },
  settlement: { fa: 'تسویه', en: 'Settlement' },
  partner: { fa: 'حساب شرکا', en: 'Partners' },
  asset: { fa: 'دارایی', en: 'Asset' },
  depreciation: { fa: 'استهلاک', en: 'Depreciation' },
  misc_receivable: { fa: 'طلبات متفرقه', en: 'Misc. receivables' },
  other: { fa: 'سایر', en: 'Other' },
};

export const JOURNAL_MARK_META = [
  { key: 'office' as const, fa: 'ه', en: 'ه' },
  { key: 'accounting' as const, fa: 'ح', en: 'ح' },
  { key: 'supervisor' as const, fa: 'ن', en: 'ن' },
  { key: 'chief' as const, fa: 'ا', en: 'ا' },
];

export function emptyMarks(): JournalApprovalMarks {
  return { office: false, accounting: false, supervisor: false, chief: false };
}

export function formatJournalValue(row: Pick<JournalEntryRow, 'qty' | 'unit' | 'amount' | 'currency'>) {
  if (row.qty && row.qty > 0) {
    return `${row.qty.toLocaleString('en-US', { maximumFractionDigits: 3 })} ${row.unit || 'تن'}`;
  }
  return null;
}

export type JournalLinkChip = {
  href: string;
  labelFa: string;
  labelEn: string;
};

export function resolveJournalLinks(links?: JournalLinks): JournalLinkChip[] {
  if (!links) return [];
  const out: JournalLinkChip[] = [];
  if (links.customerId) {
    out.push({
      href: `/dashboard/customers/${links.customerId}`,
      labelFa: 'مشتری',
      labelEn: 'Customer',
    });
  }
  if (links.supplierId) {
    out.push({
      href: `/dashboard/suppliers/${links.supplierId}`,
      labelFa: 'تأمین‌کننده',
      labelEn: 'Vendor',
    });
  }
  if (links.exchangeId) {
    out.push({
      href: `/dashboard/exchange/${links.exchangeId}`,
      labelFa: 'صراف',
      labelEn: 'Exchange',
    });
  }
  if (links.contractId) {
    out.push({
      href: `/dashboard/contracts/${links.contractId}`,
      labelFa: 'قرارداد',
      labelEn: 'Contract',
    });
  }
  if (links.partyId) {
    out.push({
      href: `/dashboard/parties/${links.partyId}`,
      labelFa: 'پارتی',
      labelEn: 'Party',
    });
  }
  if (links.warehouseId) {
    out.push({
      href: `/dashboard/warehouses/${links.warehouseId}`,
      labelFa: 'ذخیره',
      labelEn: 'Storage',
    });
  }
  if (links.saleId) {
    out.push({ href: '/dashboard/sales', labelFa: 'فروش', labelEn: 'Sales' });
  }
  if (links.purchaseId) {
    out.push({ href: '/dashboard/purchases', labelFa: 'خرید', labelEn: 'Purchase' });
  }
  if (links.expenseId) {
    out.push({
      href: '/dashboard/finance/expenses',
      labelFa: 'مصارف',
      labelEn: 'Expenses',
    });
  }
  if (links.bankAccountId || links.bank) {
    out.push({
      href: links.bankAccountId
        ? `/dashboard/finance/banks`
        : '/dashboard/finance/banks',
      labelFa: 'بانک',
      labelEn: 'Bank',
    });
  }
  if (links.cashAccountId || links.cash) {
    out.push({ href: '/dashboard/finance/cash', labelFa: 'صندوق/خزانه', labelEn: 'Cash' });
  }
  if (links.partnerAccountId || links.miscReceivableId || links.assetAccountId || links.depreciationAccountId || links.ledgerAccountId) {
    out.push({
      href: '/dashboard/finance/ledger',
      labelFa: 'حساب دفتر کل',
      labelEn: 'Ledger account',
    });
  }
  return out;
}

export function journalMatchesLink(
  links: JournalLinks | undefined,
  filter: Partial<JournalLinks>
) {
  if (!links) return false;
  if (filter.customerId && links.customerId === filter.customerId) return true;
  if (filter.supplierId && links.supplierId === filter.supplierId) return true;
  if (filter.exchangeId && links.exchangeId === filter.exchangeId) return true;
  if (filter.contractId && links.contractId === filter.contractId) return true;
  if (filter.partyId && links.partyId === filter.partyId) return true;
  if (filter.warehouseId && links.warehouseId === filter.warehouseId) return true;
  if (filter.saleId && links.saleId === filter.saleId) return true;
  if (filter.purchaseId && links.purchaseId === filter.purchaseId) return true;
  if (filter.expenseId && links.expenseId === filter.expenseId) return true;
  if (filter.partnerAccountId && links.partnerAccountId === filter.partnerAccountId) return true;
  if (filter.ledgerAccountId && links.ledgerAccountId === filter.ledgerAccountId) return true;
  return false;
}

export function nextJournalBookNumber(rows: Array<Record<string, unknown>>) {
  const nums = rows
    .map((r) => Number(String(r.number ?? '').replace(/[^\d]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  return String((nums.length ? Math.max(...nums) : 0) + 1);
}

export function sortDayRows<T extends { lineOrder?: number; id: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const ao = a.lineOrder ?? a.id;
    const bo = b.lineOrder ?? b.id;
    if (ao !== bo) return ao - bo;
    return a.id - b.id;
  });
}

export function nextLineOrder(dayRows: Array<{ lineOrder?: number; id: number }>) {
  if (!dayRows.length) return 10;
  const max = Math.max(...dayRows.map((r) => r.lineOrder ?? r.id));
  return max + 10;
}

/** Insert between prev and next by averaging orders (or append). */
export function lineOrderBetween(
  prev?: { lineOrder?: number; id: number },
  next?: { lineOrder?: number; id: number }
) {
  const p = prev ? prev.lineOrder ?? prev.id : 0;
  const n = next ? next.lineOrder ?? next.id : p + 20;
  if (n > p) return Math.floor((p + n) / 2) || p + 1;
  return p + 10;
}
