/* Operational catalog + demo for customer resale flow. */

export type CompanyKey = 'arya' | 'turkmen';

export const products: Array<{ code: string; name: string; unit: string }> = [
  { code: 'DIESEL', name: 'دیزل', unit: 'تن' },
  { code: 'PETROL', name: 'پطرول', unit: 'تن' },
  { code: 'PETROL-92', name: 'پطرول ۹۲', unit: 'تن' },
  { code: 'GAS', name: 'گاز', unit: 'تن' },
  { code: 'LPG', name: 'LPG', unit: 'تن' },
];

export type ProductCode = (typeof products)[number]['code'];

export const emptyGoods = (): Record<string, number> =>
  Object.fromEntries(products.map((p) => [p.code, 0]));

export type CustomerRecord = {
  id: number;
  code: string;
  name: string;
  phone: string;
  creditLimit: number;
  status: 'active' | 'warning';
  lastTxn: string;
  companies: {
    arya: { cashBalance: number; goods: Record<string, number> };
    turkmen: { cashBalance: number; goods: Record<string, number> };
  };
};

export const customers: CustomerRecord[] = [
  {
    id: 1,
    code: 'CUST-001',
    name: 'احمد تجارتی',
    phone: '0700123456',
    creditLimit: 500000,
    status: 'active',
    lastTxn: '1404/05/22',
    companies: {
      arya: { cashBalance: -130000, goods: { ...emptyGoods(), DIESEL: 0 } },
      turkmen: { cashBalance: 0, goods: emptyGoods() },
    },
  },
  {
    id: 2,
    code: 'CUST-002',
    name: 'رضا نفت',
    phone: '0700987654',
    creditLimit: 800000,
    status: 'active',
    lastTxn: '1404/05/23',
    companies: {
      arya: { cashBalance: -145000, goods: { ...emptyGoods(), DIESEL: 100 } },
      turkmen: { cashBalance: 0, goods: emptyGoods() },
    },
  },
];

export const customerLedgers: Record<number, Array<{
  id: number;
  dateJalali: string;
  dateGregorian: string;
  party: string;
  details: string;
  product: string;
  qty: number;
  unitPrice: number;
  loading: number;
  goodsBalance: number;
  totalPrice: number;
  receipt: number;
  cashBalance: number;
  warehouse: string;
  notes: string;
  company: CompanyKey;
  txnType: 'purchase' | 'loading' | 'takeback' | 'resale' | 'receipt' | 'payment';
  relatedCustomerId?: number;
  relatedCustomerName?: string;
  sourceUnitPrice?: number;
}>> = {
  1: [
    {
      id: 1,
      dateJalali: '1404/05/20',
      dateGregorian: '2025-08-11',
      party: 'شرکت آریا',
      details: 'خرید ۱۰۰ تن دیزل',
      product: 'دیزل',
      qty: 100,
      unitPrice: 1300,
      loading: 0,
      goodsBalance: 100,
      totalPrice: 130000,
      receipt: 0,
      cashBalance: -130000,
      warehouse: 'گدام مرکزی',
      notes: 'خرید اولیه مشتری',
      company: 'arya',
      txnType: 'purchase',
    },
    {
      id: 2,
      dateJalali: '1404/05/22',
      dateGregorian: '2025-08-13',
      party: 'شرکت آریا',
      details: 'استرداد ۱۰۰ تن دیزل برای فروش مجدد',
      product: 'دیزل',
      qty: 0,
      unitPrice: 1300,
      loading: 100,
      goodsBalance: 0,
      totalPrice: 0,
      receipt: 0,
      cashBalance: -130000,
      warehouse: 'گدام مرکزی',
      notes: 'همان ۱۰۰ تن به مشتری رضا نفت فروخته می‌شود',
      company: 'arya',
      txnType: 'takeback',
      relatedCustomerId: 2,
      relatedCustomerName: 'رضا نفت',
      sourceUnitPrice: 1300,
    },
  ],
  2: [
    {
      id: 1,
      dateJalali: '1404/05/23',
      dateGregorian: '2025-08-14',
      party: 'شرکت آریا',
      details: 'خرید ۱۰۰ تن دیزل — فروش مجدد از موجودی احمد تجارتی',
      product: 'دیزل',
      qty: 100,
      unitPrice: 1450,
      loading: 0,
      goodsBalance: 100,
      totalPrice: 145000,
      receipt: 0,
      cashBalance: -145000,
      warehouse: 'گدام مرکزی',
      notes: 'منبع: احمد تجارتی | سود شرکت: ۱۵۰ دلار/تن',
      company: 'arya',
      txnType: 'resale',
      relatedCustomerId: 1,
      relatedCustomerName: 'احمد تجارتی',
      sourceUnitPrice: 1300,
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const suppliers: any[] = [
  {
    id: 1,
    code: 'SUP-001',
    name: 'Gulf Petro FZE',
    country: 'امارات',
    phone: '+971501112233',
    cashBalance: -736000,
    lastTxn: '1404/05/23',
    goods: { ...emptyGoods(), DIESEL: 2100, LPG: 90 },
  },
  {
    id: 2,
    code: 'SUP-002',
    name: 'Caspian Fuels',
    country: 'ترکمنستان',
    phone: '+993611223344',
    cashBalance: -1057500,
    lastTxn: '1404/05/22',
    goods: { ...emptyGoods(), PETROL: 800, GAS: 150 },
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supplierLedgers: Record<number, any[]> = {
  1: [
    {
      id: 1,
      number: 'SL-1001',
      dateJalali: '1404/05/15',
      dateGregorian: '2025-08-06',
      party: 'Gulf Petro FZE',
      details: 'خرید دیزل گیدرو — پارتی اول',
      location: 'هرات',
      contract: 'CNT-1404-01',
      product: 'دیزل گیدرو',
      qty: 1200,
      loading: 180,
      goodsBalance: 1020,
      unitPrice: 1280,
      totalPrice: 1536000,
      payment: 800000,
      receipt: 800000,
      cashBalance: -736000,
      deposit: 0,
      driver: 'کریم احمدی',
      plate: 'هرات-۴۴۱۲',
      notes: 'فاکتور PINV-24081',
    },
    {
      id: 2,
      number: 'SL-1002',
      dateJalali: '1404/05/20',
      dateGregorian: '2025-08-11',
      party: 'Gulf Petro FZE',
      details: 'بارگیری به گدام آقینه',
      location: 'آقینه',
      contract: 'CNT-1404-01',
      product: 'دیزل گیدرو',
      qty: 0,
      loading: 63.5,
      goodsBalance: 956.5,
      unitPrice: 1280,
      totalPrice: 0,
      payment: 0,
      receipt: 0,
      cashBalance: -736000,
      deposit: 50000,
      driver: 'نعمت الله',
      plate: 'هرات-۲۲۰۱',
      notes: 'SH-24082',
    },
  ],
  2: [
    {
      id: 1,
      number: 'SL-2001',
      dateJalali: '1404/05/19',
      dateGregorian: '2025-08-10',
      party: 'Caspian Fuels',
      details: 'خرید پطرول ۹۲',
      location: 'مزار',
      contract: 'CNT-1404-02',
      product: 'پطرول ۹۲',
      qty: 800,
      loading: 40,
      goodsBalance: 760,
      unitPrice: 1180,
      totalPrice: 944000,
      payment: 0,
      receipt: 0,
      cashBalance: -944000,
      deposit: 0,
      driver: 'حبیب الرحمن',
      plate: 'مزار-118',
      notes: 'فاکتور PINV-24082',
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const contracts: any[] = [
  {
    id: 1,
    number: 'CNT-1404-01',
    supplierName: 'Gulf Petro FZE',
    product: 'دیزل',
    totalQty: 5000,
    arrived: 2100,
    unloaded: 1850,
    sold: 1200,
    shortage: 18,
    waste: 12,
    sellable: 1620,
    transit: 250,
    location: 'هرات',
    company: 'arya',
    pricePerUnit: 1280,
    status: 'active',
  },
  {
    id: 2,
    number: 'CNT-1404-02',
    supplierName: 'Caspian Fuels',
    product: 'پطرول',
    totalQty: 3000,
    arrived: 800,
    unloaded: 620,
    sold: 40,
    shortage: 6,
    waste: 4,
    sellable: 570,
    transit: 180,
    location: 'مزار',
    company: 'turkmen',
    pricePerUnit: 1180,
    status: 'active',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parties: any[] = [
  {
    id: 1,
    number: 'P-01',
    contractId: 1,
    contractNumber: 'CNT-1404-01',
    location: 'هرات',
    wagons: 18,
    qty: 1200,
    arrived: 1200,
    unloaded: 1188,
    sold: 1000,
    shortage: 8,
    waste: 4,
    sellable: 176,
    transit: 0,
    status: 'تخلیه',
  },
  {
    id: 2,
    number: 'P-02',
    contractId: 1,
    contractNumber: 'CNT-1404-01',
    location: 'تورغندی',
    wagons: 10,
    qty: 620,
    arrived: 620,
    unloaded: 400,
    sold: 200,
    shortage: 6,
    waste: 4,
    sellable: 190,
    transit: 220,
    status: 'در مسیر',
  },
  {
    id: 3,
    number: 'P-01',
    contractId: 2,
    contractNumber: 'CNT-1404-02',
    location: 'مزار',
    wagons: 12,
    qty: 800,
    arrived: 800,
    unloaded: 620,
    sold: 40,
    shortage: 6,
    waste: 4,
    sellable: 570,
    transit: 180,
    status: 'تخلیه',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const foreignArrivals: any[] = [
  {
    id: 1,
    number: 'FA-001',
    dateJalali: '1404/05/16',
    dateGregorian: '2025-08-07',
    product: 'دیزل گیدرو',
    supplier: 'Gulf Petro FZE',
    supplierId: 1,
    contractId: 1,
    contractNumber: 'CNT-1404-01',
    shipmentNo: 'SH-24081',
    wagons: 18,
    seymirWeight: 1200,
    unloadedWagons: 18,
    unloadedWeight: 1188,
    shortage: 12,
    location: 'اسلام‌قلعه',
    originCountry: 'ترکمنستان',
    border: 'آقینه',
    destWarehouse: 'گدام مرکزی هرات',
    status: 'تخلیه کامل',
    company: 'arya',
    notes: 'پارتی P-01',
  },
  {
    id: 2,
    number: 'FA-002',
    dateJalali: '1404/05/20',
    dateGregorian: '2025-08-11',
    product: 'پطرول ۹۲',
    supplier: 'Caspian Fuels',
    supplierId: 2,
    contractId: 2,
    contractNumber: 'CNT-1404-02',
    shipmentNo: 'SH-24090',
    wagons: 12,
    seymirWeight: 800,
    unloadedWagons: 9,
    unloadedWeight: 620,
    shortage: 6,
    location: 'آقینه',
    originCountry: 'ترکمنستان',
    border: 'آقینه',
    destWarehouse: 'گدام ترکمن',
    status: 'در تخلیه',
    company: 'turkmen',
    notes: '',
  },
];

const emptyExpenses = {
  transport: 2400,
  bankCommission: 180,
  railway: 620,
  truckRent: 900,
  storage: 120,
  fine: 0,
  loading: 210,
  foreignCustoms: 840,
  otherForeign: 80,
  customs: 8400,
  telex: 40,
  railwayLocal: 300,
  oilServices: 150,
  lab: 90,
  demurrage: 0,
  port: 0,
  transportLocal: 480,
  storageLocal: 60,
  literCommission: 0,
  weighing: 35,
  transfer: 1800,
  government: 200,
  contractCost: 0,
  office: 120,
  otherLocal: 50,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const goodsArrivals: any[] = [
  {
    id: 1,
    number: 'GA-001',
    dateJalali: '1404/05/18',
    dateGregorian: '2025-08-09',
    supplier: 'Gulf Petro FZE',
    supplierId: 1,
    loaderCompany: 'Gulf Petro FZE',
    contractId: 1,
    contractNumber: 'CNT-1404-01',
    product: 'دیزل گیدرو',
    location: 'هرات',
    loadSite: 'ترکمن‌باشی',
    unloadSite: 'هرات',
    route: 'ترکمن‌باشی ← آقینه ← هرات',
    wagonNumber: 'W-4412',
    railwayCarriageNo: 'RC-88912',
    description: 'دیزل گیدرو پارتی اول',
    cmrNumber: 'CMR-8891',
    cmrWeight: 62.4,
    netWeight: 61.8,
    weightDiff: -0.6,
    pricePerUnit: 1280,
    totalPrice: 79104,
    balance: 79104,
    currency: 'USD',
    status: 'تخلیه',
    notes: 'مرتبط با SH-24081',
    company: 'arya',
    expenses: { ...emptyExpenses },
  },
  {
    id: 2,
    number: 'GA-002',
    dateJalali: '1404/05/22',
    dateGregorian: '2025-08-13',
    supplier: 'Caspian Fuels',
    supplierId: 2,
    loaderCompany: 'Caspian Fuels',
    contractId: 2,
    contractNumber: 'CNT-1404-02',
    product: 'پطرول ۹۲',
    location: 'مزار',
    loadSite: 'ترکمن‌باشی',
    unloadSite: 'حیرتان',
    route: 'ترکمن‌باشی ← حیرتان ← مزار',
    wagonNumber: 'W-4418',
    railwayCarriageNo: 'RC-90211',
    description: 'پطرول ۹۲ وارده جنسی',
    cmrNumber: 'CMR-8902',
    cmrWeight: 64.1,
    netWeight: 63.7,
    weightDiff: -0.4,
    pricePerUnit: 1180,
    totalPrice: 75166,
    balance: 75166,
    currency: 'USD',
    status: 'در_راه',
    notes: '',
    company: 'turkmen',
    expenses: { ...emptyExpenses, customs: 5100, transport: 1800 },
  },
];

const unitPrice = {
  DIESEL: 1280,
  PETROL: 1180,
  'PETROL-92': 1210,
  GAS: 890,
  LPG: 760,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const warehouses: any[] = [
  {
    id: 1,
    name: 'گدام مرکزی هرات',
    location: 'هرات',
    type: 'عمومی',
    company: 'arya',
    capacity: 8000,
    waste: 12,
    shortage: 4,
    stock: { ...emptyGoods(), DIESEL: 1680, PETROL: 180, LPG: 40 },
    reserved: { ...emptyGoods(), DIESEL: 120 },
    unitPrice,
  },
  {
    id: 2,
    name: 'گدام ترکمن',
    location: 'مزار شریف',
    type: 'عمومی',
    company: 'turkmen',
    capacity: 4500,
    waste: 6,
    shortage: 2,
    stock: { ...emptyGoods(), PETROL: 940, GAS: 210, DIESEL: 320 },
    reserved: { ...emptyGoods(), PETROL: 60 },
    unitPrice,
  },
  {
    id: 3,
    name: 'ترانزیت تورغندی',
    location: 'تورغندی',
    type: 'ترانزیت',
    company: 'arya',
    capacity: 2000,
    waste: 0,
    shortage: 0,
    stock: { ...emptyGoods(), DIESEL: 250 },
    reserved: emptyGoods(),
    unitPrice,
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const warehouseMovements: Record<number, any[]> = {
  1: [
    { id: 1, date: '1404/05/18', type: 'in', product: 'دیزل', qty: 61.8, ref: 'GA-001', notes: 'وارده جنسی' },
    { id: 2, date: '1404/05/23', type: 'out', product: 'دیزل', qty: 100, ref: 'DLV-331', notes: 'بارگیری رضا نفت' },
    { id: 3, date: '1404/05/19', type: 'transfer', product: 'دیزل', qty: 80, ref: 'TR-088', notes: 'به تانک ۲' },
  ],
  2: [
    { id: 1, date: '1404/05/22', type: 'in', product: 'پطرول', qty: 63.7, ref: 'GA-002', notes: 'وارده جنسی' },
  ],
  3: [
    { id: 1, date: '1404/05/20', type: 'in', product: 'دیزل', qty: 250, ref: 'P-02', notes: 'پارتی ترانزیت' },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const journalEntries: any[] = [
  {
    id: 1,
    number: 'JR-24081',
    dateJalali: '1404/05/15',
    dateGregorian: '2025-08-06',
    giver: 'Gulf Petro FZE',
    receiver: 'شرکت آریا',
    details: 'پرداخت بخشی از فاکتور خرید دیزل',
    amount: 800000,
    currency: 'USD',
    opType: 'payment',
    status: 'paid',
    company: 'arya',
    links: { supplierId: 1, bank: true, purchaseId: 1 },
  },
  {
    id: 2,
    number: 'JR-24091',
    dateJalali: '1404/05/22',
    dateGregorian: '2025-08-13',
    giver: 'رضا نفت',
    receiver: 'شرکت آریا',
    details: 'پیش‌پرداخت فاکتور فروش',
    amount: 50000,
    currency: 'USD',
    opType: 'receipt',
    status: 'received',
    company: 'arya',
    links: { customerId: 2, cash: true, saleId: 1 },
  },
  {
    id: 3,
    number: 'JR-24093',
    dateJalali: '1404/05/23',
    dateGregorian: '2025-08-14',
    giver: 'شرکت آریا',
    receiver: 'حمل هرات',
    details: 'کرایه موتر',
    amount: 1800,
    currency: 'USD',
    opType: 'expense',
    status: 'paid',
    company: 'arya',
    links: { cash: true, expenseId: 1 },
  },
  {
    id: 4,
    number: 'JR-24094',
    dateJalali: '1404/05/23',
    dateGregorian: '2025-08-14',
    giver: 'شرکت ترکمن',
    receiver: 'عزیزی بانک',
    details: 'انتقال به حساب بانکی',
    amount: 12000,
    currency: 'USD',
    opType: 'transfer',
    status: 'pending',
    company: 'turkmen',
    links: { bank: true },
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exchangeHouses: any[] = [
  {
    id: 1,
    name: 'صرافی کابل',
    currency: 'USD / AFN',
    totalIn: 42000,
    totalOut: 28600,
    balance: 13400,
    fxPnl: 860,
    company: 'arya',
  },
  {
    id: 2,
    name: 'صرافی دبی',
    currency: 'USD / AED',
    totalIn: 18000,
    totalOut: 11200,
    balance: 6800,
    fxPnl: 240,
    company: 'turkmen',
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exchangeTransactions: Record<number, any[]> = {
  1: [
    {
      id: 1,
      number: 'EX-101',
      dateJalali: '1404/05/20',
      dateGregorian: '2025-08-11',
      remittanceNo: 'RM-7781',
      details: 'خرید افغانی',
      counterparty: 'صرافی بازار',
      received: 42000,
      paid: 0,
      balance: 42000,
      aedEquivalent: 0,
      rate: 68.4,
      currency: 'USD',
      commission: 120,
      principalAmount: 42000,
      convertedAmount: 2872800,
      company: 'arya',
    },
    {
      id: 2,
      number: 'EX-102',
      dateJalali: '1404/05/22',
      dateGregorian: '2025-08-13',
      remittanceNo: 'RM-7788',
      details: 'پرداخت معاش',
      counterparty: 'بانک ملی',
      received: 0,
      paid: 28600,
      balance: 13400,
      aedEquivalent: 0,
      rate: 68.9,
      currency: 'USD',
      commission: 85,
      principalAmount: 28600,
      convertedAmount: 1970540,
      company: 'arya',
    },
  ],
  2: [
    {
      id: 1,
      number: 'EX-201',
      dateJalali: '1404/05/18',
      dateGregorian: '2025-08-09',
      remittanceNo: 'RM-2201',
      details: 'حواله درهم',
      counterparty: 'صرافی دبی',
      received: 18000,
      paid: 0,
      balance: 18000,
      aedEquivalent: 66000,
      rate: 3.67,
      currency: 'AED',
      commission: 60,
      principalAmount: 18000,
      convertedAmount: 66000,
      company: 'turkmen',
    },
    {
      id: 2,
      number: 'EX-202',
      dateJalali: '1404/05/21',
      dateGregorian: '2025-08-12',
      remittanceNo: 'RM-2210',
      details: 'پرداخت تأمین‌کننده',
      counterparty: 'Caspian Fuels',
      received: 0,
      paid: 11200,
      balance: 6800,
      aedEquivalent: 41100,
      rate: 3.67,
      currency: 'AED',
      commission: 40,
      principalAmount: 11200,
      convertedAmount: 41104,
      company: 'turkmen',
    },
  ],
};

const emptyKpi = {
  salesToday: 0,
  purchasesToday: 0,
  cash: 0,
  bank: 0,
  receivables: 0,
  payables: 0,
  inventoryValue: 0,
  activeContracts: 0,
  inTransit: 0,
  grossProfit: 0,
  netProfit: 0,
  fxRateUsdAfn: 0,
  fxRateUsdAed: 0,
};

export const dashboardKpis = {
  both: { ...emptyKpi },
  arya: { ...emptyKpi },
  turkmen: { ...emptyKpi },
};

export const financialSummary = {
  both: {
    purchaseBalance: 71560,
    customerBalance: 184920,
    salesBalance: 256480,
    profitLoss: 18420,
    openingCapital: 420000,
    closingCapital: 438420,
    banks: 123000,
    treasury: 41200,
    cashReserves: 28600,
    exchangeAccounts: 19800,
    inventoryValue: 256480,
    txnCount: 128,
    expenses: { bankCommission: 420, transfer: 1800, trading: 2400, misc: 760, total: 5380 },
  },
  arya: {
    purchaseBalance: 48200,
    customerBalance: 130000,
    salesBalance: 168400,
    profitLoss: 12100,
    openingCapital: 260000,
    closingCapital: 272100,
    banks: 78000,
    treasury: 24100,
    cashReserves: 16400,
    exchangeAccounts: 11200,
    inventoryValue: 168400,
    txnCount: 74,
    expenses: { bankCommission: 240, transfer: 980, trading: 1500, misc: 420, total: 3140 },
  },
  turkmen: {
    purchaseBalance: 23360,
    customerBalance: 54920,
    salesBalance: 88080,
    profitLoss: 6320,
    openingCapital: 160000,
    closingCapital: 166320,
    banks: 45000,
    treasury: 17100,
    cashReserves: 12200,
    exchangeAccounts: 8600,
    inventoryValue: 88080,
    txnCount: 54,
    expenses: { bankCommission: 180, transfer: 820, trading: 900, misc: 340, total: 2240 },
  },
};

export const alerts: Array<{ id: number; type: 'danger' | 'warning' | 'info'; text: string }> = [
  { id: 1, type: 'warning', text: 'درخواست استرداد کالا برای فروش مجدد ثبت شده است' },
  { id: 2, type: 'danger', text: 'بیلانس نقدی مشتری احمد تجارتی منفی است' },
  { id: 3, type: 'info', text: 'وارده جنسی جدید در انتظار بررسی است' },
];
export const chartMonthly: Array<{ month: string; purchase: number; sales: number }> = [
  { month: 'ثور', purchase: 18, sales: 22 },
  { month: 'جوزا', purchase: 21, sales: 26 },
  { month: 'سرطان', purchase: 16, sales: 24 },
  { month: 'اسد', purchase: 22, sales: 28 },
];
export const productMix: Array<{ name: string; value: number }> = [
  { name: 'دیزل', value: 48 },
  { name: 'پطرول', value: 27 },
  { name: 'گاز', value: 15 },
  { name: 'LPG', value: 10 },
];

export function goodsValue(goods: Record<string, number>, prices?: Record<string, number>) {
  const p = prices ?? {};
  return Object.entries(goods || {}).reduce((sum, [k, q]) => sum + q * (p[k] ?? 0), 0);
}

export function sumGoods(a: Record<string, number>, b: Record<string, number>) {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const out: Record<string, number> = {};
  keys.forEach((k) => {
    out[k] = (a?.[k] ?? 0) + (b?.[k] ?? 0);
  });
  return out;
}

export {
  inventorySkus,
  emptyInventoryStock,
  cmrShipments,
  companyPurchases,
  physicalWarehouses,
  foreignContractSummaries,
  balanceSheetAccounts,
  customerReceivablesMatrix,
} from './excel-ops';
export type { CmrShipment } from './excel-ops';
