/**
 * Excel-style operational datasets shared across the 15 linked ledgers.
 * One transaction concept feeds related pages (purchase → CMR → warehouse → P&L).
 */

export type CompanyKey = 'arya' | 'turkmen';

/** Physical inventory SKUs (warehouse matrix columns) */
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

/** Page 1+3: CMR / wagon shipments (incl. Diesel Gydro) */
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

export const cmrShipments: CmrShipment[] = [
  {
    id: 1,
    number: 'SH-24081',
    dateJalali: '1404/05/18',
    dateGregorian: '2025-08-09',
    year: 1404,
    loaderCompany: 'Gulf Petro FZE',
    wagonNumber: 'W-4412',
    location: 'هرات',
    railwayCarriageNo: 'RC-88912',
    description: 'دیزل گیدرو — پارتی اول',
    cmrNumber: 'CMR-8891',
    cmrWeight: 62.4,
    netWeight: 61.8,
    weightDiff: -0.6,
    balance: 61.8,
    pricePerTon: 1280,
    totalPrice: 79104,
    currency: 'USD',
    notes: 'مرتبط با GA-001 / CNT-1404-01',
    status: 'تخلیه',
    company: 'arya',
    product: 'دیزل گیدرو',
    productCode: 'DIESEL-GYDRO',
    loadSite: 'ترکمن‌باشی',
    unloadSite: 'هرات',
    route: 'ترکمن‌باشی ← آقینه ← هرات',
    contractNumber: 'CNT-1404-01',
    contractId: 1,
    supplierId: 1,
    isGydro: true,
  },
  {
    id: 2,
    number: 'SH-24082',
    dateJalali: '1404/05/20',
    dateGregorian: '2025-08-11',
    year: 1404,
    loaderCompany: 'Gulf Petro FZE',
    wagonNumber: 'W-4415',
    location: 'آقینه',
    railwayCarriageNo: 'RC-88940',
    description: 'دیزل گیدرو — پارتی دوم',
    cmrNumber: 'CMR-8910',
    cmrWeight: 64.0,
    netWeight: 63.5,
    weightDiff: -0.5,
    balance: 63.5,
    pricePerTon: 1280,
    totalPrice: 81280,
    currency: 'USD',
    notes: '',
    status: 'ترانزیت',
    company: 'arya',
    product: 'دیزل گیدرو',
    productCode: 'DIESEL-GYDRO',
    loadSite: 'ترکمن‌باشی',
    unloadSite: 'آقینه',
    route: 'ترکمن‌باشی ← آقینه',
    contractNumber: 'CNT-1404-01',
    contractId: 1,
    supplierId: 1,
    isGydro: true,
  },
  {
    id: 3,
    number: 'SH-24090',
    dateJalali: '1404/05/22',
    dateGregorian: '2025-08-13',
    year: 1404,
    loaderCompany: 'Caspian Fuels',
    wagonNumber: 'W-4418',
    location: 'مزار',
    railwayCarriageNo: 'RC-90211',
    description: 'پطرول ۹۲ — وارده جنسی',
    cmrNumber: 'CMR-8902',
    cmrWeight: 64.1,
    netWeight: 63.7,
    weightDiff: -0.4,
    balance: 63.7,
    pricePerTon: 1180,
    totalPrice: 75166,
    currency: 'USD',
    notes: 'مرتبط با GA-002',
    status: 'تخلیه',
    company: 'turkmen',
    product: 'پطرول ۹۲',
    productCode: 'PETROL-92',
    loadSite: 'ترکمن‌باشی',
    unloadSite: 'حیرتان',
    route: 'ترکمن‌باشی ← حیرتان ← مزار',
    contractNumber: 'CNT-1404-02',
    contractId: 2,
    supplierId: 2,
    isGydro: false,
  },
  {
    id: 4,
    number: 'SH-24101',
    dateJalali: '1403/11/12',
    dateGregorian: '2025-02-01',
    year: 1403,
    loaderCompany: 'Gulf Petro FZE',
    wagonNumber: 'W-3301',
    location: 'هرات',
    railwayCarriageNo: 'RC-77120',
    description: 'دیزل گیدرو سال قبل',
    cmrNumber: 'CMR-7701',
    cmrWeight: 60.2,
    netWeight: 59.8,
    weightDiff: -0.4,
    balance: 0,
    pricePerTon: 1210,
    totalPrice: 72358,
    currency: 'USD',
    notes: 'فروش کامل',
    status: 'فروش',
    company: 'arya',
    product: 'دیزل گیدرو',
    productCode: 'DIESEL-GYDRO',
    loadSite: 'بندرعباس',
    unloadSite: 'اسلام‌قلعه',
    route: 'بندرعباس ← اسلام‌قلعه ← هرات',
    contractNumber: 'CNT-1403-18',
    contractId: 1,
    supplierId: 1,
    isGydro: true,
  },
];

/** Page 9: company purchases */
export const companyPurchases = [
  {
    id: 1,
    number: 'PUR-1404-018',
    dateJalali: '1404/05/15',
    dateGregorian: '2025-08-06',
    seller: 'Gulf Petro FZE',
    contract: 'CNT-1404-01',
    product: 'دیزل گیدرو',
    location: 'هرات',
    qty: 1200,
    unit: 'تن',
    rate: 1280,
    amount: 1536000,
    currency: 'USD',
    freight: 24000,
    otherCosts: 8600,
    paid: 800000,
    balance: 769600,
    payStatus: 'جزئی',
    goodsStatus: 'دریافت‌شده',
    notes: 'پارتی اول',
    company: 'arya' as CompanyKey,
  },
  {
    id: 2,
    number: 'PUR-1404-019',
    dateJalali: '1404/05/19',
    dateGregorian: '2025-08-10',
    seller: 'Caspian Fuels',
    contract: 'CNT-1404-02',
    product: 'پطرول ۹۲',
    location: 'مزار',
    qty: 800,
    unit: 'تن',
    rate: 1180,
    amount: 944000,
    currency: 'USD',
    freight: 16000,
    otherCosts: 5100,
    paid: 0,
    balance: 965100,
    payStatus: 'بدهی',
    goodsStatus: 'در_راه',
    notes: '',
    company: 'turkmen' as CompanyKey,
  },
  {
    id: 3,
    number: 'PUR-1404-020',
    dateJalali: '1404/05/22',
    dateGregorian: '2025-08-13',
    seller: 'Gulf Petro FZE',
    contract: 'CNT-1404-01',
    product: 'دیزل روسی',
    location: 'آقینه',
    qty: 400,
    unit: 'تن',
    rate: 1260,
    amount: 504000,
    currency: 'USD',
    freight: 9200,
    otherCosts: 2100,
    paid: 504000,
    balance: 11300,
    payStatus: 'تسویه کالا',
    goodsStatus: 'دریافت‌شده',
    notes: 'هزینه حمل باز',
    company: 'arya' as CompanyKey,
  },
];

/** Page 8: physical warehouses with wide SKU matrix */
export const physicalWarehouses: Array<{
  id: number;
  name: string;
  location: string;
  company: CompanyKey;
  stock: Record<string, number>;
}> = [
  {
    id: 1,
    name: 'ذخیره آقینه',
    location: 'آقینه',
    company: 'arya' as CompanyKey,
    stock: {
      ...emptyInventoryStock(),
      'DIESEL-GYDRO': 420,
      DIESEL: 180,
      'PETROL-92': 60,
      'GAS-AQ': 40,
    },
  },
  {
    id: 2,
    name: 'ذخیره حیرتان',
    location: 'حیرتان',
    company: 'turkmen' as CompanyKey,
    stock: {
      ...emptyInventoryStock(),
      'DIESEL-RU': 310,
      'PETROL-92': 220,
      EURO5: 80,
      'DIESEL-05-TM': 140,
    },
  },
  {
    id: 3,
    name: 'گدام مرکزی هرات',
    location: 'هرات',
    company: 'arya' as CompanyKey,
    stock: {
      ...emptyInventoryStock(),
      'DIESEL-GYDRO': 860,
      DIESEL: 820,
      'DIESEL-IR': 120,
      'PETROL-92-B': 90,
      'JET-TC1': 35,
      OIL: 18,
    },
  },
  {
    id: 4,
    name: 'ذخیره ترانزیت تورغندی',
    location: 'تورغندی',
    company: 'arya' as CompanyKey,
    stock: {
      ...emptyInventoryStock(),
      DIESEL: 250,
      'DIESEL-B': 40,
    },
  },
];

/** Page 7: foreign supplier contract rollups */
export const foreignContractSummaries = [
  {
    id: 1,
    supplier: 'Gulf Petro FZE',
    supplierId: 1,
    contractNumber: 'CNT-1404-01',
    contractId: 1,
    product: 'دیزل گیدرو',
    contractQty: 5000,
    unit: 'تن',
    location: 'هرات / آقینه',
    arrivedWagons: 48,
    unloaded: 1850,
    sold: 1200,
    shortage: 18,
    waste: 12,
    sellable: 1620,
    transit: 250,
    inventory: 1620,
    remaining: 2900,
    company: 'arya' as CompanyKey,
  },
  {
    id: 2,
    supplier: 'Caspian Fuels',
    supplierId: 2,
    contractNumber: 'CNT-1404-02',
    contractId: 2,
    product: 'پطرول ۹۲',
    contractQty: 3000,
    unit: 'تن',
    location: 'حیرتان / مزار',
    arrivedWagons: 32,
    unloaded: 620,
    sold: 40,
    shortage: 6,
    waste: 4,
    sellable: 570,
    transit: 180,
    inventory: 570,
    remaining: 2200,
    company: 'turkmen' as CompanyKey,
  },
];

/** Page 11: balance sheet line items */
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

/** Page 14: customer cash + goods by company/location/product */
export const customerReceivablesMatrix: Array<{
  id: number;
  customerId: number;
  customer: string;
  cashClaim: number;
  companies: Record<string, Record<string, Record<string, number>>>;
}> = [
  {
    id: 1,
    customerId: 1,
    customer: 'احمد تجارتی',
    cashClaim: -130000,
    companies: {
      arya: {
        آقینه: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
        حیرتان: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
        هرات: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
      },
      turkmen: {
        حیرتان: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
        آقینه: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
        هرات: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
      },
    },
  },
  {
    id: 2,
    customerId: 2,
    customer: 'رضا نفت',
    cashClaim: -145000,
    companies: {
      arya: {
        آقینه: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 20 },
        حیرتان: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
        هرات: { DIESEL: 100, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 40 },
      },
      turkmen: {
        حیرتان: { DIESEL: 0, PETROL: 15, GAS: 0, 'DIESEL-GYDRO': 0 },
        آقینه: { DIESEL: 0, PETROL: 0, GAS: 10, 'DIESEL-GYDRO': 0 },
        هرات: { DIESEL: 0, PETROL: 0, GAS: 0, 'DIESEL-GYDRO': 0 },
      },
    },
  },
];
