/**
 * Excel-style operational datasets shared across the 15 linked ledgers.
 */

export type CompanyKey = 'arya' | 'turkmen';

export const inventorySkus: Array<{ code: string; name: string; nameEn: string; unit: string; group: 'fuel' | 'food' | 'other' }> = [
  { code: 'DIESEL', name: 'دیزل', nameEn: 'Diesel', unit: 'تن', group: 'fuel' },
  { code: 'DIESEL-GYDRO', name: 'دیزل گیدرو', nameEn: 'Gydro diesel', unit: 'تن', group: 'fuel' },
  { code: 'DIESEL-IR', name: 'دیزل ایرانی', nameEn: 'Iranian diesel', unit: 'تن', group: 'fuel' },
  { code: 'DIESEL-B', name: 'دیزل بخارایی', nameEn: 'Bukhara diesel', unit: 'تن', group: 'fuel' },
  { code: 'DIESEL-RU', name: 'دیزل روسی', nameEn: 'Russian diesel', unit: 'تن', group: 'fuel' },
  { code: 'DIESEL-BY', name: 'دیزل بلاروسی', nameEn: 'Belarus diesel', unit: 'تن', group: 'fuel' },
  { code: 'DIESEL-05-TM', name: 'دیزل ۰۵ ترکمنی', nameEn: 'Turkmen diesel 05', unit: 'تن', group: 'fuel' },
  { code: 'EURO5', name: 'یورو ۵', nameEn: 'Euro 5', unit: 'تن', group: 'fuel' },
  { code: 'PETROL-92', name: 'پطرول ۹۲', nameEn: 'Petrol 92', unit: 'تن', group: 'fuel' },
  { code: 'PETROL-92-B', name: 'پطرول ۹۲ بخارایی', nameEn: 'Bukhara petrol 92', unit: 'تن', group: 'fuel' },
  { code: 'PETROL-80', name: 'پطرول ۸۰', nameEn: 'Petrol 80', unit: 'تن', group: 'fuel' },
  { code: 'JET-TC1', name: 'تیل طیاره TC-1', nameEn: 'Jet fuel TC-1', unit: 'تن', group: 'fuel' },
  { code: 'GAS-AQ', name: 'گاز آقینه', nameEn: 'Aqina gas', unit: 'تن', group: 'fuel' },
  { code: 'OIL', name: 'روغن', nameEn: 'Edible oil', unit: 'تن', group: 'food' },
  { code: 'SUGAR', name: 'شکر', nameEn: 'Sugar', unit: 'تن', group: 'food' },
  { code: 'WHEAT', name: 'گندم', nameEn: 'Wheat', unit: 'تن', group: 'food' },
  { code: 'FLOUR', name: 'آرد', nameEn: 'Flour', unit: 'تن', group: 'food' },
  { code: 'RICE', name: 'برنج', nameEn: 'Rice', unit: 'تن', group: 'food' },
  { code: 'CORN', name: 'جواری', nameEn: 'Corn', unit: 'تن', group: 'food' },
  { code: 'TEA', name: 'چای', nameEn: 'Tea', unit: 'تن', group: 'food' },
  { code: 'FERT', name: 'کود کیمیاوی', nameEn: 'Fertilizer', unit: 'تن', group: 'other' },
  { code: 'OTHER', name: 'سایر اجناس', nameEn: 'Other goods', unit: 'تن', group: 'other' },
];

export function emptyInventoryStock(): Record<string, number> {
  return Object.fromEntries(inventorySkus.map((s) => [s.code, 0]));
}

export type CmrShipment = {
  id: number;
  number: string;
  dateJalali: string;
  dateGregorian: string;
  year: number;
  loaderCompany: string;
  wagonNumber: string;
  location: string;
  railwayCarriageNo: string;
  description: string;
  cmrNumber: string;
  cmrWeight: number;
  netWeight: number;
  weightDiff: number;
  balance: number;
  pricePerTon: number;
  totalPrice: number;
  currency: string;
  notes: string;
  status: 'در_راه' | 'تخلیه' | 'فروش' | 'ترانزیت' | 'بسته';
  company: CompanyKey;
  product: string;
  productCode: string;
  loadSite: string;
  unloadSite: string;
  route: string;
  contractNumber: string;
  contractId: number;
  supplierId: number;
  isGydro: boolean;
};

export const cmrShipments: CmrShipment[] = [];

export const companyPurchases: Array<{
  id: number;
  number: string;
  dateJalali: string;
  dateGregorian: string;
  seller: string;
  contract: string;
  product: string;
  location: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  currency: string;
  freight: number;
  otherCosts: number;
  paid: number;
  balance: number;
  payStatus: string;
  goodsStatus: string;
  notes: string;
  company: CompanyKey;
}> = [];

export const physicalWarehouses: Array<{
  id: number;
  name: string;
  location: string;
  company: CompanyKey;
  stock: Record<string, number>;
}> = [];

export const foreignContractSummaries: Array<{
  id: number;
  supplier: string;
  supplierId: number;
  contractNumber: string;
  contractId: number;
  product: string;
  contractQty: number;
  unit: string;
  location: string;
  arrivedWagons: number;
  unloaded: number;
  sold: number;
  shortage: number;
  waste: number;
  sellable: number;
  transit: number;
  inventory: number;
  remaining: number;
  company: CompanyKey;
}> = [];

export const balanceSheetAccounts = {
  trade: [
    { key: 'purchase', titleFa: 'خرید', titleEn: 'Purchase', amountKey: 'purchaseBalance' as const },
    { key: 'customerBuy', titleFa: 'مشتری (خریداری)', titleEn: 'Customer purchases', amountKey: 'customerBalance' as const },
    { key: 'sales', titleFa: 'فروش', titleEn: 'Sales', amountKey: 'salesBalance' as const },
    { key: 'customerSell', titleFa: 'مشتری (فروشات)', titleEn: 'Customer sales', amountKey: 'salesBalance' as const },
    { key: 'grossPl', titleFa: 'مفاد و ضرر ناخالص', titleEn: 'Gross P&L', amountKey: 'profitLoss' as const },
  ],
  assets: [
    { titleFa: 'سرمایه ابتدایی شرکت', type: 'سرمایه', amountKey: 'openingCapital' as const, currency: 'USD' },
    { titleFa: 'شرکت ترکمن پطرولیمیتد', type: 'شرکت وابسته', amountKey: 'exchangeAccounts' as const, currency: 'USD' },
    { titleFa: 'بانک‌ها', type: 'بانک', amountKey: 'banks' as const, currency: 'USD' },
    { titleFa: 'حساب‌های دالری', type: 'بانک', amountKey: 'banks' as const, currency: 'USD' },
    { titleFa: 'حساب‌های افغانی', type: 'بانک', amountKey: 'treasury' as const, currency: 'AFN' },
    { titleFa: 'صرافی‌ها', type: 'صرافی', amountKey: 'exchangeAccounts' as const, currency: 'USD' },
    { titleFa: 'خزانه دفتر', type: 'صندوق', amountKey: 'treasury' as const, currency: 'USD' },
    { titleFa: 'ذخیره مواد', type: 'موجودی', amountKey: 'inventoryValue' as const, currency: 'USD' },
    { titleFa: 'ذخیره انتقالی', type: 'موجودی', amountKey: 'cashReserves' as const, currency: 'USD' },
    { titleFa: 'ذخایر دیگر', type: 'موجودی', amountKey: 'cashReserves' as const, currency: 'USD' },
  ],
};

export const customerReceivablesMatrix: Array<{
  id: number;
  customerId: number;
  customer: string;
  cashClaim: number;
  companies: Record<string, Record<string, Record<string, number>>>;
}> = [];
