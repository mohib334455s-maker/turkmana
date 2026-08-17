/* eslint-disable @typescript-eslint/no-explicit-any */
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

export type CustomerLedgerRow = {
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
};

export const customers: CustomerRecord[] = [];
export const customerLedgers: Record<number, CustomerLedgerRow[]> = {};

export type SupplierRecord = {
  id: number;
  code: string;
  name: string;
  country: string;
  phone: string;
  cashBalance: number;
  lastTxn: string;
  goods: Record<string, number>;
};

export const suppliers: SupplierRecord[] = [];
export const supplierLedgers: Record<number, any[]> = {};

export type ContractRecord = {
  id: number;
  number: string;
  supplierName: string;
  supplierId: number;
  product: string;
  totalQty: number;
  arrived: number;
  unloaded: number;
  sold: number;
  shortage: number;
  waste: number;
  sellable: number;
  transit: number;
  location: string;
  company: CompanyKey;
  pricePerUnit: number;
  status: string;
  wagons?: number;
};

export const contracts: ContractRecord[] = [];

export type PartyRecord = {
  id: number;
  number: string;
  contractId: number;
  contractNumber: string;
  location: string;
  wagons: number;
  qty: number;
  arrived: number;
  unloaded: number;
  sold: number;
  shortage: number;
  waste: number;
  sellable: number;
  transit: number;
  status: string;
};

export const parties: PartyRecord[] = [];

export type ForeignArrivalRecord = {
  id: number;
  number: string;
  dateJalali: string;
  dateGregorian?: string;
  product: string;
  supplier: string;
  supplierId: number;
  contractId: number;
  contractNumber: string;
  shipmentNo: string;
  wagons: number;
  seymirWeight: number;
  unloadedWagons: number;
  unloadedWeight: number;
  shortage: number;
  location: string;
  originCountry: string;
  border: string;
  destWarehouse: string;
  status: string;
  company: CompanyKey;
  notes: string;
};

export const foreignArrivals: ForeignArrivalRecord[] = [];

export type GoodsArrivalRecord = {
  id: number;
  number: string;
  dateJalali: string;
  dateGregorian: string;
  supplier: string;
  supplierId: number;
  loaderCompany: string;
  contractId: number;
  contractNumber: string;
  product: string;
  location: string;
  loadSite: string;
  unloadSite: string;
  route: string;
  wagonNumber: string;
  railwayCarriageNo: string;
  description: string;
  cmrNumber: string;
  cmrWeight: number;
  netWeight: number;
  weightDiff: number;
  pricePerUnit: number;
  totalPrice: number;
  balance: number;
  currency: string;
  status: string;
  notes: string;
  company: CompanyKey;
  warehouse?: string;
  warehouseId?: number;
  expenses?: Record<string, number>;
};

export const goodsArrivals: GoodsArrivalRecord[] = [];

export type WarehouseRecord = {
  id: number;
  name: string;
  location: string;
  type: string;
  company: CompanyKey;
  capacity: number;
  waste: number;
  shortage: number;
  stock: Record<string, number>;
  reserved: Record<string, number>;
  unitPrice?: Record<string, number>;
};

export const warehouses: WarehouseRecord[] = [];
export const warehouseMovements: Record<number, Array<Record<string, string | number>>> = {};

export type JournalEntry = {
  id: number;
  number: string;
  dateJalali: string;
  dateGregorian: string;
  giver: string;
  receiver: string;
  details: string;
  amount: number;
  currency: string;
  opType: string;
  status: string;
  company: CompanyKey;
  links?: Record<string, number | boolean>;
};

export const journalEntries: JournalEntry[] = [];

export type ExchangeHouse = {
  id: number;
  name: string;
  currency: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  fxPnl: number;
  company: CompanyKey | 'both';
};

export const exchangeHouses: ExchangeHouse[] = [];
export const exchangeTransactions: Record<number, any[]> = {};

const emptyFin = {
  purchaseBalance: 0,
  customerBalance: 0,
  salesBalance: 0,
  profitLoss: 0,
  openingCapital: 0,
  closingCapital: 0,
  banks: 0,
  treasury: 0,
  cashReserves: 0,
  exchangeAccounts: 0,
  inventoryValue: 0,
  txnCount: 0,
  expenses: { bankCommission: 0, transfer: 0, trading: 0, misc: 0, total: 0 },
};

export const dashboardKpis = {
  both: {
    activeContracts: 0,
    inTransit: 0,
    grossProfit: 0,
    netProfit: 0,
    fxRateUsdAfn: 0,
    fxRateUsdAed: 0,
  },
  arya: {
    activeContracts: 0,
    inTransit: 0,
    grossProfit: 0,
    netProfit: 0,
    fxRateUsdAfn: 0,
    fxRateUsdAed: 0,
  },
  turkmen: {
    activeContracts: 0,
    inTransit: 0,
    grossProfit: 0,
    netProfit: 0,
    fxRateUsdAfn: 0,
    fxRateUsdAed: 0,
  },
};

export const financialSummary = {
  both: { ...emptyFin },
  arya: { ...emptyFin },
  turkmen: { ...emptyFin },
};

export const alerts: Array<{ id: number; type: 'danger' | 'warning' | 'info'; text: string }> = [];
export const chartMonthly: Array<{ month: string; purchase: number; sales: number }> = [];
export const productMix: Array<{ name: string; value: number }> = [];

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
