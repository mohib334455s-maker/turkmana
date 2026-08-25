/** Catalog of trading currencies — only a few enabled by default. */

export type CurrencyDef = {
  code: string;
  fa: string;
  en: string;
  symbol: string;
  /** Enabled out of the box */
  defaultEnabled: boolean;
};

export const CURRENCY_CATALOG: CurrencyDef[] = [
  { code: 'USD', fa: 'دالر امریکایی', en: 'US Dollar', symbol: '$', defaultEnabled: true },
  { code: 'AFN', fa: 'افغانی', en: 'Afghan Afghani', symbol: '؋', defaultEnabled: true },
  { code: 'AED', fa: 'درهم امارات', en: 'UAE Dirham', symbol: 'د.إ', defaultEnabled: true },
  { code: 'EUR', fa: 'یورو', en: 'Euro', symbol: '€', defaultEnabled: true },
  { code: 'GBP', fa: 'پوند انگلیس', en: 'British Pound', symbol: '£', defaultEnabled: false },
  { code: 'SAR', fa: 'ریال سعودی', en: 'Saudi Riyal', symbol: '﷼', defaultEnabled: false },
  { code: 'IRR', fa: 'ریال ایران', en: 'Iranian Rial', symbol: 'ریال', defaultEnabled: false },
  { code: 'TRY', fa: 'لیره ترکیه', en: 'Turkish Lira', symbol: '₺', defaultEnabled: false },
  { code: 'CNY', fa: 'یوان چین', en: 'Chinese Yuan', symbol: '¥', defaultEnabled: false },
  { code: 'RUB', fa: 'روبل روسیه', en: 'Russian Ruble', symbol: '₽', defaultEnabled: false },
  { code: 'INR', fa: 'روپیه هند', en: 'Indian Rupee', symbol: '₹', defaultEnabled: false },
  { code: 'PKR', fa: 'روپیه پاکستان', en: 'Pakistani Rupee', symbol: 'Rs', defaultEnabled: false },
  { code: 'JPY', fa: 'ین جاپان', en: 'Japanese Yen', symbol: '¥', defaultEnabled: false },
  { code: 'CHF', fa: 'فرانک سویس', en: 'Swiss Franc', symbol: 'Fr', defaultEnabled: false },
  { code: 'CAD', fa: 'دالر کانادا', en: 'Canadian Dollar', symbol: 'C$', defaultEnabled: false },
  { code: 'AUD', fa: 'دالر استرالیا', en: 'Australian Dollar', symbol: 'A$', defaultEnabled: false },
  { code: 'KWD', fa: 'دینار کویت', en: 'Kuwaiti Dinar', symbol: 'د.ك', defaultEnabled: false },
  { code: 'QAR', fa: 'ریال قطر', en: 'Qatari Riyal', symbol: 'ر.ق', defaultEnabled: false },
  { code: 'OMR', fa: 'ریال عمان', en: 'Omani Rial', symbol: 'ر.ع', defaultEnabled: false },
  { code: 'TMT', fa: 'منات ترکمنستان', en: 'Turkmenistan Manat', symbol: 'm', defaultEnabled: false },
];

export function defaultEnabledCurrencyCodes() {
  return CURRENCY_CATALOG.filter((c) => c.defaultEnabled).map((c) => c.code);
}
