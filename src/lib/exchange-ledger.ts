import type { CompanyKey } from '@/lib/demo-data';
import {
  formatJalali,
  formatJalaliWeekday,
  gregorianFromIso,
  parseIsoDate,
} from '@/lib/date-utils';

export type ExchangeTxnKind =
  | 'remittance_in'
  | 'remittance_out'
  | 'cash_withdrawal';

/** منبع برداشت نقدی / پرداخت */
export type CashDrawerSource =
  | 'exchanger_drawer'
  | 'treasury'
  | 'joint'
  | 'cash_register'
  | 'other_house';

export type ExchangeTxn = {
  id: number;
  houseId: number;
  number: number;
  dateIso: string;
  dateJalali: string;
  dateGregorian: string;
  weekday: string;
  kind: ExchangeTxnKind;
  remittanceNo: string;
  details: string;
  counterparty: string;
  currency: string;
  received: number;
  paid: number;
  balance: number;
  drawerSource?: CashDrawerSource;
  drawerSourceHouseId?: number;
  drawerSourceLabel?: string;
  purchaseRef?: string;
  rate?: number;
  commission?: number;
  principalAmount?: number;
  convertedAmount?: number;
  aedEquivalent?: number;
  company: CompanyKey;
  notes?: string;
};

export function drawerSourceLabel(
  source: CashDrawerSource | undefined,
  locale: 'fa' | 'en',
  custom?: string
) {
  if (custom?.trim()) return custom.trim();
  const fa: Record<CashDrawerSource, string> = {
    exchanger_drawer: 'درک / صندوق صرافی',
    treasury: 'خزانه',
    joint: 'حساب مشترک',
    cash_register: 'صندوق / دخل',
    other_house: 'صرافی / خزانه دیگر',
  };
  const en: Record<CashDrawerSource, string> = {
    exchanger_drawer: 'Exchanger drawer',
    treasury: 'Treasury',
    joint: 'Joint account',
    cash_register: 'Cash register',
    other_house: 'Other house / treasury',
  };
  if (!source) return locale === 'en' ? '—' : '—';
  return locale === 'en' ? en[source] : fa[source];
}

export function txnKindLabel(kind: ExchangeTxnKind, locale: 'fa' | 'en') {
  const fa: Record<ExchangeTxnKind, string> = {
    remittance_in: 'دریافت / حواله ورودی',
    remittance_out: 'پرداخت / حواله خروجی',
    cash_withdrawal: 'برداشت نقدی',
  };
  const en: Record<ExchangeTxnKind, string> = {
    remittance_in: 'Incoming remittance',
    remittance_out: 'Outgoing remittance',
    cash_withdrawal: 'Cash withdrawal',
  };
  return locale === 'en' ? en[kind] : fa[kind];
}

export function formatTxnDates(dateIso: string) {
  const when = parseIsoDate(dateIso);
  return {
    dateJalali: formatJalali(when),
    dateGregorian: gregorianFromIso(dateIso),
    weekday: formatJalaliWeekday(when),
  };
}

export function nextTxnNumber(txns: ExchangeTxn[]) {
  return txns.reduce((max, t) => Math.max(max, Number(t.number) || 0), 0) + 1;
}

export function nextRemittanceNo(txns: ExchangeTxn[]) {
  const n = txns.reduce((max, t) => {
    const raw = String(t.remittanceNo || '').replace(/\D/g, '');
    return Math.max(max, Number(raw) || 0);
  }, 0);
  return String(n + 1).padStart(5, '0');
}
