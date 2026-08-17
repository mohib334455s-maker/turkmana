/* eslint-disable @typescript-eslint/no-explicit-any */
import { MASTER_PRODUCTS } from '@/lib/catalog-master';

export type CompanyKey = 'arya' | 'turkmen';

export const products: Array<{ code: string; name: string; unit: string }> = MASTER_PRODUCTS.map(
  (p) => ({ code: p.code, name: p.name, unit: p.unit })
);

export type ProductCode = string;

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

export type RepresentativeRecord = {
  id: number;
  code: string;
  name: string;
  phone: string;
  region: string;
  cashBalance: number;
  lastTxn: string;
  goods: Record<string, number>;
  notes: string;
};

export const representatives: RepresentativeRecord[] = [];

export type ContractRecord = {
  id: number;
  number: string;
  supplierName: string;
  supplierId: number;
  product: string;
  productCode?: string;
  unit?: string;
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
  notes?: string;
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
  weekday?: string;
  giver: string;
  receiver: string;
  details: string;
  amount: number;
  currency: string;
  qty?: number;
  unit?: string;
  opType: string;
  status: string;
  company: CompanyKey;
  links?: Record<string, number | boolean>;
  marks?: {
    office?: boolean;
    accounting?: boolean;
    supervisor?: boolean;
    chief?: boolean;
  };
};

export const journalEntries: JournalEntry[] = [];

/** exchanger = صرافی عادی · joint = حساب مشترک · treasury = خزانه */
export type ExchangeAccountKind = 'exchanger' | 'joint' | 'treasury';

export type ExchangeHouse = {
  id: number;
  name: string;
  currency: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  fxPnl: number;
  company: CompanyKey | 'both';
  /** Default exchanger; joint/treasury appear in separate summary rows */
  kind?: ExchangeAccountKind;
  location?: string;
  notes?: string;
};

/** طلب بالای صرافی (مثبت) و باقیات از صرافی (منفی) جدا گزارش می‌شوند — یکجا جمع نمی‌شوند. */
export function summarizeExchangeBalances(rows: ExchangeHouse[]) {
  const exchangers = rows.filter((r) => (r.kind ?? 'exchanger') === 'exchanger');
  const joint = rows.filter((r) => r.kind === 'joint');
  const treasury = rows.filter((r) => r.kind === 'treasury');

  let claimsOnExchangers = 0; // جمله طلب بالای صرافی‌ها
  let dueFromExchangers = 0; // جمله باقیات از صرافی‌ها

  for (const row of exchangers) {
    const bal = Number(row.balance) || 0;
    if (bal > 0) claimsOnExchangers += bal;
    else if (bal < 0) dueFromExchangers += Math.abs(bal);
  }

  const exchangerInventory = exchangers.reduce((s, r) => s + (Number(r.balance) || 0), 0);
  const jointTotal = joint.reduce((s, r) => s + (Number(r.balance) || 0), 0);
  const treasuryTotal = treasury.reduce((s, r) => s + (Number(r.balance) || 0), 0);

  return {
    exchangers,
    joint,
    treasury,
    claimsOnExchangers,
    dueFromExchangers,
    exchangerInventory,
    jointTotal,
    treasuryTotal,
    /** موجودی صرافی با خزانه (بدون قاطی کردن طلب و باقیات در یک رقم راپور طلب/بدهی) */
    exchangerPlusTreasury: exchangerInventory + jointTotal + treasuryTotal,
  };
}

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
