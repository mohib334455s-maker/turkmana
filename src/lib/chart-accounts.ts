/** Predefined ledger / special accounts beyond customer, bank, exchange, treasury. */

export type ChartAccountKind =
  | 'partner'
  | 'misc_receivable'
  | 'asset'
  | 'depreciation'
  | 'liability'
  | 'equity'
  | 'income'
  | 'expense'
  | 'other';

export type ChartAccountDef = {
  code: string;
  nameFa: string;
  nameEn: string;
  kind: ChartAccountKind;
  defaultEnabled: boolean;
};

export const CHART_ACCOUNT_CATALOG: ChartAccountDef[] = [
  { code: '1100', nameFa: 'صندوق / خزانه', nameEn: 'Cash / treasury', kind: 'asset', defaultEnabled: true },
  { code: '1200', nameFa: 'بانک‌ها', nameEn: 'Banks', kind: 'asset', defaultEnabled: true },
  { code: '1300', nameFa: 'صرافی‌ها', nameEn: 'Exchanges', kind: 'asset', defaultEnabled: true },
  { code: '1400', nameFa: 'حساب مشتریان (طلب)', nameEn: 'Customer receivables', kind: 'asset', defaultEnabled: true },
  { code: '1450', nameFa: 'حساب طلبات متفرقه', nameEn: 'Miscellaneous receivables', kind: 'misc_receivable', defaultEnabled: true },
  { code: '1500', nameFa: 'موجودی کالا', nameEn: 'Inventory', kind: 'asset', defaultEnabled: true },
  { code: '1600', nameFa: 'دارایی‌های ثابت', nameEn: 'Fixed assets', kind: 'asset', defaultEnabled: true },
  { code: '1650', nameFa: 'استهلاک انباشته', nameEn: 'Accumulated depreciation', kind: 'depreciation', defaultEnabled: true },
  { code: '1700', nameFa: 'حساب شرکا — سرمایه', nameEn: 'Partners — capital', kind: 'partner', defaultEnabled: true },
  { code: '1710', nameFa: 'حساب شرکا — جاری', nameEn: 'Partners — current', kind: 'partner', defaultEnabled: true },
  { code: '2100', nameFa: 'حساب تأمین‌کنندگان (باقی)', nameEn: 'Supplier payables', kind: 'liability', defaultEnabled: true },
  { code: '2200', nameFa: 'قرضه‌ها', nameEn: 'Loans', kind: 'liability', defaultEnabled: true },
  { code: '3100', nameFa: 'سرمایه', nameEn: 'Equity', kind: 'equity', defaultEnabled: true },
  { code: '4100', nameFa: 'فروش', nameEn: 'Sales', kind: 'income', defaultEnabled: true },
  { code: '5100', nameFa: 'مصارف عملیاتی', nameEn: 'Operating expenses', kind: 'expense', defaultEnabled: true },
  { code: '5200', nameFa: 'مصارف بارگیری و تخلیه', nameEn: 'Loading & unloading costs', kind: 'expense', defaultEnabled: true },
  { code: '5300', nameFa: 'هزینه استهلاک', nameEn: 'Depreciation expense', kind: 'depreciation', defaultEnabled: true },
];

export const CHART_KIND_LABELS: Record<ChartAccountKind, { fa: string; en: string }> = {
  partner: { fa: 'شرکا', en: 'Partners' },
  misc_receivable: { fa: 'طلبات متفرقه', en: 'Misc. receivables' },
  asset: { fa: 'دارایی', en: 'Asset' },
  depreciation: { fa: 'استهلاک', en: 'Depreciation' },
  liability: { fa: 'بدهی', en: 'Liability' },
  equity: { fa: 'حقوق صاحبان', en: 'Equity' },
  income: { fa: 'درآمد', en: 'Income' },
  expense: { fa: 'مصارف', en: 'Expense' },
  other: { fa: 'سایر', en: 'Other' },
};

export function chartAccountsByKind(kind: ChartAccountKind) {
  return CHART_ACCOUNT_CATALOG.filter((a) => a.kind === kind);
}

export function seedLedgerRows(company: 'arya' | 'turkmen' = 'arya') {
  return CHART_ACCOUNT_CATALOG.filter((a) => a.defaultEnabled).map((a, i) => ({
    id: i + 1,
    code: a.code,
    name: a.nameFa,
    type:
      a.kind === 'partner' || a.kind === 'equity'
        ? 'equity'
        : a.kind === 'misc_receivable' || a.kind === 'asset'
          ? 'asset'
          : a.kind === 'depreciation'
            ? 'expense'
            : a.kind === 'liability'
              ? 'liability'
              : a.kind === 'income'
                ? 'income'
                : 'expense',
    kind: a.kind,
    debit: 0,
    credit: 0,
    balance: 0,
    company,
    status: 'active',
    notes: a.nameEn,
  }));
}
