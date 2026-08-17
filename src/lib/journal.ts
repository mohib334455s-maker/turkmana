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
  | 'other';

export type JournalApprovalMarks = {
  /** ه — دفتر / هرات */
  office: boolean;
  /** ح — حسابداری */
  accounting: boolean;
  /** ن — نظارت */
  supervisor: boolean;
  /** ا — آمر */
  chief: boolean;
};

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
  bank?: boolean;
  cash?: boolean;
};

export type JournalEntryRow = {
  id: number;
  number: string;
  dateJalali: string;
  dateGregorian: string;
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
  links?: JournalLinks;
  marks?: JournalApprovalMarks;
};

export const JOURNAL_OP_LABELS: Record<string, { fa: string; en: string }> = {
  receipt: { fa: 'دریافت', en: 'Receipt' },
  payment: { fa: 'پرداخت', en: 'Payment' },
  purchase: { fa: 'خرید', en: 'Purchase' },
  sale: { fa: 'فروش', en: 'Sale' },
  transfer: { fa: 'انتقال', en: 'Transfer' },
  expense: { fa: 'هزینه', en: 'Expense' },
  loading: { fa: 'بارگیری', en: 'Loading' },
  unload: { fa: 'تخلیه', en: 'Unload' },
  goods_report: { fa: 'راپور جنسی', en: 'Goods report' },
  loan: { fa: 'قرضه', en: 'Loan' },
  settlement: { fa: 'تسویه', en: 'Settlement' },
  other: { fa: 'سایر', en: 'Other' },
};

/** Letter headers from the paper journal — meaning is left unlabeled until confirmed. */
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

/** Resolve every linked account to a real route so journal chips never go nowhere. */
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
  if (links.bank) {
    out.push({ href: '/dashboard/finance/banks', labelFa: 'بانک', labelEn: 'Bank' });
  }
  if (links.cash) {
    out.push({ href: '/dashboard/finance/cash', labelFa: 'صندوق', labelEn: 'Cash' });
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
  return false;
}

export function nextJournalBookNumber(rows: Array<Record<string, unknown>>) {
  const nums = rows
    .map((r) => Number(String(r.number ?? '').replace(/[^\d]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  return String((nums.length ? Math.max(...nums) : 0) + 1);
}
