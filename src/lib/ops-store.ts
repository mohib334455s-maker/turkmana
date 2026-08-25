'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CrudRow } from '@/components/shared/crud-page';
import type {
  CompanyKey,
  ContractRecord,
  CustomerLedgerRow,
  CustomerRecord,
  RepresentativeRecord,
  SupplierRecord,
} from '@/lib/demo-data';
import { emptyGoods } from '@/lib/demo-data';
import type {
  CompanyPurchase,
  PurchaseInvoice,
  PurchaseOrder,
  PurchaseStatus,
} from '@/lib/purchase-flow';
import type { StockLot, WarehouseEntity } from '@/lib/stock-lots';
import { todayIso } from '@/lib/purchase-flow';
import type { CustomerGoodsLot, GoodsResale } from '@/lib/customer-resale';
import { jalaliFromIso, lastLedgerBalances } from '@/lib/customer-resale';
import type { ExpenseAccount, ExpenseEntry } from '@/lib/expense-ledger';
import type { StorageCashEntry, StorageGoodsMove, WagonRentStay } from '@/lib/storage-ledger';
import { accrueWagonRent, wagonRentDetails } from '@/lib/storage-ledger';
import { emptyMarks, nextJournalBookNumber } from '@/lib/journal';
import { isContractOpenForExpenses, isPartyOpenForExpenses } from '@/lib/permissions';
import { partyHasOpenStock, partyPatchAfterLoad, partyPatchAfterUnload } from '@/lib/party-storage';
import {
  formatJalali,
  formatJalaliWeekday,
  gregorianFromIso,
  parseIsoDate,
} from '@/lib/date-utils';
import type { CashDrawerSource, ExchangeTxn, ExchangeTxnKind } from '@/lib/exchange-ledger';
import {
  formatTxnDates,
  nextRemittanceNo,
  nextTxnNumber,
} from '@/lib/exchange-ledger';
import type { ContractPayment } from '@/lib/contract-payments';
import { amountFromPercent, contractValue } from '@/lib/contract-payments';

export type OpsRow = Record<string, unknown> & {
  id: number;
};

type PurchaseOrderInput = Omit<PurchaseOrder, 'id' | 'code' | 'amount' | 'status'> & {
  status?: PurchaseStatus;
};

type CompanyPurchaseInput = {
  purchaseOrderId: number;
  date: string;
  qty: number;
  freight: number;
  otherCosts: number;
  paid: number;
  location: string;
  contract: string;
  notes: string;
};

type InvoicePatch = Partial<
  Pick<PurchaseInvoice, 'code' | 'dueDate' | 'paid' | 'notes' | 'status' | 'date' | 'amount'>
>;

type SellToCustomerInput = {
  customerId: number;
  productCode: string;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
  date: string;
  company: CompanyKey;
  details?: string;
  warehouse?: string;
  notes?: string;
  stockLotId?: number;
};

type ResellFromCustomerInput = {
  sourceLotId: number;
  targetCustomerId: number;
  qty: number;
  resaleUnitPrice: number;
  date: string;
  details?: string;
  notes?: string;
};

type CustomerCashTxnInput = {
  customerId: number;
  company: CompanyKey;
  amount: number;
  txnType: 'receipt' | 'payment';
  date: string;
  details?: string;
  notes?: string;
};

type ExpenseAccountInput = Omit<ExpenseAccount, 'id'>;
type ExpenseEntryInput = Omit<ExpenseEntry, 'id'>;

type OpsState = {
  contracts: ContractRecord[];
  customers: CustomerRecord[];
  suppliers: SupplierRecord[];
  representatives: RepresentativeRecord[];
  lists: Record<string, OpsRow[]>;
  crud: Record<string, CrudRow[]>;
  purchaseOrders: PurchaseOrder[];
  purchaseInvoices: PurchaseInvoice[];
  companyPurchases: CompanyPurchase[];
  warehouseEntities: WarehouseEntity[];
  stockLots: StockLot[];
  customerLedgers: Record<number, CustomerLedgerRow[]>;
  customerGoodsLots: CustomerGoodsLot[];
  goodsResales: GoodsResale[];
  expenseAccounts: ExpenseAccount[];
  expenseEntries: ExpenseEntry[];
  storageCashEntries: StorageCashEntry[];
  storageGoodsMoves: StorageGoodsMove[];
  wagonRentStays: WagonRentStay[];
  exchangeTxns: ExchangeTxn[];
  contractPayments: ContractPayment[];
  addContract: (input: Omit<ContractRecord, 'id'>) => ContractRecord;
  updateContract: (id: number, patch: Partial<ContractRecord>) => void;
  removeContract: (id: number) => void;
  addContractPayment: (input: {
    contractId: number;
    dateIso: string;
    amount?: number;
    percent?: number;
    method?: string;
    notes?: string;
  }) => ContractPayment | null;
  removeContractPayment: (id: number) => void;
  setCustomers: (rows: CustomerRecord[]) => void;
  setSuppliers: (rows: SupplierRecord[]) => void;
  setRepresentatives: (rows: RepresentativeRecord[]) => void;
  getList: (key: string) => OpsRow[];
  setList: (key: string, rows: OpsRow[]) => void;
  addToList: (key: string, row: Omit<OpsRow, 'id'> & { id?: number }) => OpsRow;
  updateInList: (key: string, id: number, patch: Record<string, unknown>) => void;
  removeFromList: (key: string, id: number) => void;
  addExchangeTxn: (input: {
    houseId: number;
    dateIso: string;
    kind: ExchangeTxnKind;
    received?: number;
    paid?: number;
    remittanceNo?: string;
    details?: string;
    counterparty?: string;
    currency?: string;
    drawerSource?: CashDrawerSource;
    drawerSourceHouseId?: number;
    drawerSourceLabel?: string;
    purchaseRef?: string;
    rate?: number;
    commission?: number;
    principalAmount?: number;
    convertedAmount?: number;
    company: CompanyKey;
    notes?: string;
  }) => ExchangeTxn | null;
  getExchangeTxns: (houseId: number) => ExchangeTxn[];
  getCrud: (key: string) => CrudRow[] | undefined;
  setCrud: (key: string, rows: CrudRow[]) => void;
  addPurchaseOrder: (input: PurchaseOrderInput) => PurchaseOrder;
  setPurchaseOrderStatus: (id: number, status: PurchaseStatus) => void;
  createCompanyPurchaseFromOrder: (input: CompanyPurchaseInput) => CompanyPurchase | null;
  updatePurchaseInvoice: (id: number, patch: InvoicePatch) => void;
  addWarehouse: (input: Omit<WarehouseEntity, 'id'>) => WarehouseEntity;
  updateWarehouse: (id: number, patch: Partial<WarehouseEntity>) => void;
  removeWarehouse: (id: number) => void;
  receiveToWarehouse: (input: {
    warehouseId: number;
    productCode: string;
    productName: string;
    unit: string;
    qty: number;
    unitPrice?: number;
    contractId: number;
    contractNumber: string;
    partyId?: number;
    partyNumber?: string;
    supplierName: string;
    company: CompanyKey;
    notes?: string;
  }) => StockLot | null;
  sellFromLot: (lotId: number, qty: number) => boolean;
  sellToCustomer: (input: SellToCustomerInput) => CustomerGoodsLot | null;
  resellFromCustomer: (input: ResellFromCustomerInput) => GoodsResale | null;
  recordCustomerCashTxn: (input: CustomerCashTxnInput) => boolean;
  addExpenseAccount: (input: ExpenseAccountInput) => ExpenseAccount;
  addExpenseEntry: (input: ExpenseEntryInput) => ExpenseEntry | null;
  removeExpenseEntry: (id: number) => void;
  addStorageCashEntry: (input: Omit<StorageCashEntry, 'id'>) => StorageCashEntry;
  addStorageGoodsMove: (input: Omit<StorageGoodsMove, 'id'> & { stockLotId?: number }) => StorageGoodsMove | null;
  addWagonRentStay: (input: Omit<WagonRentStay, 'id' | 'status' | 'settledEntryId'>) => WagonRentStay;
  settleWagonRent: (stayId: number, rentEndDate?: string) => StorageCashEntry | null;
  setPartyStatus: (partyId: number, status: 'active' | 'inactive') => void;
  setStockLotStatus: (lotId: number, status: StockLot['status']) => void;
};

export function nextId(rows: Array<{ id?: number }>) {
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

function pad(n: number) {
  return String(n).padStart(4, '0');
}

function makeJournalRow(
  lists: Record<string, OpsRow[]>,
  input: {
    dateIso: string;
    giver?: string;
    receiver?: string;
    details: string;
    amount?: number;
    qty?: number;
    unit?: string;
    opType: string;
    company: CompanyKey;
    links?: Record<string, number | boolean>;
  }
): OpsRow {
  const prev = lists.journal ?? [];
  const when = parseIsoDate(input.dateIso || todayIso());
  const dateJalali = formatJalali(when);
  const sameDay = prev.filter((r) => String(r.dateJalali || '') === dateJalali);
  const number = String(sameDay[0]?.number || nextJournalBookNumber(prev));
  return {
    id: nextId(prev),
    number,
    dateJalali,
    dateGregorian: gregorianFromIso(input.dateIso || todayIso()),
    weekday: formatJalaliWeekday(when),
    giver: input.giver || '',
    receiver: input.receiver || '',
    details: input.details,
    amount: input.amount || 0,
    qty: input.qty || 0,
    unit: input.unit || 'تن',
    currency: 'USD',
    opType: input.opType,
    status: 'posted',
    company: input.company,
    links: input.links,
    marks: emptyMarks(),
  };
}

function patchPartyRow(
  parties: OpsRow[],
  partyId: number,
  patchFn: (raw: Record<string, unknown>) => Record<string, unknown>
): OpsRow[] {
  return parties.map((p) => {
    if (Number(p.id) !== partyId) return p;
    return { ...p, ...patchFn(p as Record<string, unknown>) } as OpsRow;
  });
}

function afterLotDepleted(
  parties: OpsRow[],
  stockLots: StockLot[],
  partyId?: number
): OpsRow[] {
  if (!partyId) return parties;
  if (partyHasOpenStock(partyId, stockLots)) return parties;
  return patchPartyRow(parties, partyId, () => ({ status: 'inactive' }));
}

function recalcSupplier(
  suppliers: SupplierRecord[],
  invoices: PurchaseInvoice[],
  purchases: CompanyPurchase[],
  supplierId: number
): SupplierRecord[] {
  const openInvoices = invoices.filter(
    (i) => i.supplierId === supplierId && i.status !== 'cancelled'
  );
  const openPurchases = purchases.filter(
    (p) => p.supplierId === supplierId && p.status !== 'cancelled'
  );
  const cashBalance = -openInvoices.reduce((sum, i) => sum + i.balance, 0);
  const goods: Record<string, number> = {};
  for (const p of openPurchases) {
    if (!p.productCode) continue;
    goods[p.productCode] = (goods[p.productCode] ?? 0) + p.qty;
  }
  const dates = [...openPurchases, ...openInvoices]
    .map((x) => x.date)
    .filter(Boolean)
    .sort();
  const lastTxn = dates.at(-1) ?? '-';
  return suppliers.map((s) =>
    s.id === supplierId ? { ...s, cashBalance, goods, lastTxn } : s
  );
}

function patchCustomerBalances(
  customers: CustomerRecord[],
  customerId: number,
  company: CompanyKey,
  productCode: string,
  qtyDelta: number,
  cashDelta: number,
  lastTxn: string
): CustomerRecord[] {
  return customers.map((c) => {
    if (c.id !== customerId) return c;
    const current = c.companies[company];
    const goods = { ...(current.goods ?? emptyGoods()) };
    if (productCode && qtyDelta) {
      goods[productCode] = (goods[productCode] ?? 0) + qtyDelta;
    }
    return {
      ...c,
      lastTxn,
      companies: {
        ...c.companies,
        [company]: {
          cashBalance: current.cashBalance + cashDelta,
          goods,
        },
      },
    };
  });
}

function appendCustomerLedger(
  ledgers: Record<number, CustomerLedgerRow[]>,
  customerId: number,
  row: Omit<CustomerLedgerRow, 'id' | 'goodsBalance' | 'cashBalance'> & {
    goodsDelta: number;
    cashDelta: number;
  }
): Record<number, CustomerLedgerRow[]> {
  const prev = ledgers[customerId] ?? [];
  const last = lastLedgerBalances(prev);
  const { goodsDelta, cashDelta, ...rest } = row;
  const next: CustomerLedgerRow = {
    ...rest,
    id: nextId(prev),
    goodsBalance: last.goodsBalance + goodsDelta,
    cashBalance: last.cashBalance + cashDelta,
  };
  return { ...ledgers, [customerId]: [...prev, next] };
}

function txnKindFallback(kind: ExchangeTxnKind) {
  const map: Record<ExchangeTxnKind, string> = {
    remittance_in: 'حواله ورودی',
    remittance_out: 'حواله خروجی',
    cash_withdrawal: 'برداشت نقدی',
  };
  return map[kind];
}

export const useOpsStore = create<OpsState>()(
  persist(
    (set, get) => ({
      contracts: [],
      customers: [],
      suppliers: [],
      representatives: [],
      lists: {},
      crud: {},
      purchaseOrders: [],
      purchaseInvoices: [],
      companyPurchases: [],
      warehouseEntities: [],
      stockLots: [],
      customerLedgers: {},
      customerGoodsLots: [],
      goodsResales: [],
      expenseAccounts: [],
      expenseEntries: [],
      storageCashEntries: [],
      storageGoodsMoves: [],
      wagonRentStays: [],
      exchangeTxns: [],
      contractPayments: [],
      addContract: (input) => {
        const row: ContractRecord = {
          ...input,
          id: nextId(get().contracts),
          paidAmount: Number(input.paidAmount || 0),
        };
        set({ contracts: [row, ...get().contracts] });
        return row;
      },
      updateContract: (id, patch) =>
        set({
          contracts: get().contracts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }),
      removeContract: (id) =>
        set({
          contracts: get().contracts.filter((c) => c.id !== id),
          contractPayments: get().contractPayments.filter((p) => p.contractId !== id),
        }),
      addContractPayment: (input) => {
        const contract = get().contracts.find((c) => c.id === input.contractId);
        if (!contract) return null;
        const value = contractValue(contract.totalQty, contract.pricePerUnit);
        let amount = Number(input.amount || 0);
        const percent = Number(input.percent || 0);
        if ((!amount || amount <= 0) && percent > 0) {
          amount = amountFromPercent(value, percent);
        }
        if (!amount || amount <= 0) return null;
        const payment: ContractPayment = {
          id: nextId(get().contractPayments),
          contractId: contract.id,
          contractNumber: contract.number,
          dateIso: input.dateIso,
          amount,
          percent: percent || (value > 0 ? Math.round((amount / value) * 1000) / 10 : undefined),
          method: input.method || '',
          notes: input.notes || '',
          company: contract.company,
        };
        const contractPayments = [payment, ...get().contractPayments];
        const paidAmount = contractPayments
          .filter((p) => p.contractId === contract.id)
          .reduce((s, p) => s + p.amount, 0);
        set({
          contractPayments,
          contracts: get().contracts.map((c) =>
            c.id === contract.id ? { ...c, paidAmount } : c
          ),
        });
        return payment;
      },
      removeContractPayment: (id) => {
        const target = get().contractPayments.find((p) => p.id === id);
        if (!target) return;
        const contractPayments = get().contractPayments.filter((p) => p.id !== id);
        const paidAmount = contractPayments
          .filter((p) => p.contractId === target.contractId)
          .reduce((s, p) => s + p.amount, 0);
        set({
          contractPayments,
          contracts: get().contracts.map((c) =>
            c.id === target.contractId ? { ...c, paidAmount } : c
          ),
        });
      },
      setCustomers: (customers) => set({ customers }),
      setSuppliers: (suppliers) => set({ suppliers }),
      setRepresentatives: (representatives) => set({ representatives }),
      getList: (key) => get().lists[key] ?? [],
      setList: (key, rows) => set({ lists: { ...get().lists, [key]: rows } }),
      addToList: (key, row) => {
        const prev = get().lists[key] ?? [];
        const next: OpsRow = { ...row, id: row.id ?? nextId(prev) };
        const rows = [next, ...prev];
        set({ lists: { ...get().lists, [key]: rows } });
        return next;
      },
      updateInList: (key, id, patch) => {
        const prev = get().lists[key] ?? [];
        set({
          lists: {
            ...get().lists,
            [key]: prev.map((r) => (Number(r.id) === id ? { ...r, ...patch } : r)),
          },
        });
      },
      removeFromList: (key, id) => {
        const prev = get().lists[key] ?? [];
        const nextLists = {
          ...get().lists,
          [key]: prev.filter((r) => Number(r.id) !== id),
        };
        if (key === 'exchangeHouses') {
          set({
            lists: nextLists,
            exchangeTxns: get().exchangeTxns.filter((t) => t.houseId !== id),
          });
          return;
        }
        set({ lists: nextLists });
      },
      getExchangeTxns: (houseId) =>
        get()
          .exchangeTxns.filter((t) => t.houseId === houseId)
          .sort((a, b) => a.number - b.number),
      addExchangeTxn: (input) => {
        const lists = get().lists;
        const houses = (lists.exchangeHouses ?? []) as OpsRow[];
        const house = houses.find((h) => Number(h.id) === input.houseId);
        if (!house) return null;

        const allTxns = get().exchangeTxns;
        const houseTxns = allTxns.filter((t) => t.houseId === input.houseId);
        const received = Number(input.received || 0);
        const paid = Number(input.paid || 0);
        const prevBalance =
          houseTxns.length > 0
            ? houseTxns[houseTxns.length - 1].balance
            : Number(house.balance) || 0;
        const newBalance = prevBalance + received - paid;
        const dates = formatTxnDates(input.dateIso);
        const currency = input.currency || String(house.currency || 'USD');

        const txn: ExchangeTxn = {
          id: nextId(allTxns),
          houseId: input.houseId,
          number: nextTxnNumber(houseTxns),
          dateIso: input.dateIso,
          ...dates,
          kind: input.kind,
          remittanceNo: input.remittanceNo || nextRemittanceNo(allTxns),
          details: input.details || '',
          counterparty: input.counterparty || '',
          currency,
          received,
          paid,
          balance: newBalance,
          drawerSource: input.drawerSource,
          drawerSourceHouseId: input.drawerSourceHouseId,
          drawerSourceLabel: input.drawerSourceLabel,
          purchaseRef: input.purchaseRef,
          rate: input.rate,
          commission: input.commission,
          principalAmount: input.principalAmount,
          convertedAmount: input.convertedAmount,
          aedEquivalent: input.convertedAmount,
          company: input.company,
          notes: input.notes,
        };

        let nextHouses = houses.map((h) => {
          const id = Number(h.id);
          if (id === input.houseId) {
            return {
              ...h,
              balance: newBalance,
              totalIn: Number(h.totalIn || 0) + received,
              totalOut: Number(h.totalOut || 0) + paid,
            };
          }
          if (
            input.drawerSourceHouseId &&
            id === input.drawerSourceHouseId &&
            paid > 0
          ) {
            const srcBal = Number(h.balance || 0) - paid;
            return {
              ...h,
              balance: srcBal,
              totalOut: Number(h.totalOut || 0) + paid,
            };
          }
          return h;
        });

        const journal = makeJournalRow(lists, {
          dateIso: input.dateIso,
          giver: paid > 0 ? String(house.name) : input.counterparty || '',
          receiver: received > 0 ? String(house.name) : input.counterparty || '',
          details: `[صرافی] ${txn.details || txnKindFallback(input.kind)} · ${txn.remittanceNo}`,
          amount: received || paid,
          opType: 'exchange',
          company: input.company,
          links: { exchangeId: input.houseId, exchangeTxnId: txn.id },
        });

        set({
          exchangeTxns: [...allTxns, txn],
          lists: { ...lists, exchangeHouses: nextHouses, journal: [journal, ...(lists.journal ?? [])] },
        });
        return txn;
      },
      getCrud: (key) => get().crud[key],
      setCrud: (key, rows) => set({ crud: { ...get().crud, [key]: rows } }),

      addPurchaseOrder: (input) => {
        const orders = get().purchaseOrders;
        const invoices = get().purchaseInvoices;
        const id = nextId(orders);
        const invoiceId = nextId(invoices);
        const amount = Number(input.qty || 0) * Number(input.unitPrice || 0);
        const order: PurchaseOrder = {
          ...input,
          id,
          code: `PO-${pad(id)}`,
          amount,
          status: input.status ?? 'pending',
        };
        const invoice: PurchaseInvoice = {
          id: invoiceId,
          purchaseOrderId: id,
          poCode: order.code,
          code: '',
          date: order.date,
          dueDate: order.expectedDate || '',
          supplier: order.supplier,
          supplierId: order.supplierId,
          product: order.product,
          qty: order.qty,
          amount,
          paid: 0,
          balance: amount,
          currency: order.currency,
          company: order.company,
          status: 'pending',
          notes: order.notes,
        };
        set({
          purchaseOrders: [order, ...orders],
          purchaseInvoices: [invoice, ...invoices],
          suppliers: recalcSupplier(get().suppliers, [invoice, ...invoices], get().companyPurchases, order.supplierId),
        });
        return order;
      },

      setPurchaseOrderStatus: (id, status) => {
        const order = get().purchaseOrders.find((o) => o.id === id);
        if (!order) return;
        const purchaseOrders = get().purchaseOrders.map((o) =>
          o.id === id ? { ...o, status } : o
        );
        const purchaseInvoices = get().purchaseInvoices.map((inv) => {
          if (inv.purchaseOrderId !== id) return inv;
          if (status === 'cancelled') return { ...inv, status: 'cancelled' as const };
          if (inv.status === 'cancelled') return inv;
          if (status === 'approved' && inv.status === 'pending') {
            return { ...inv, status: 'approved' as const };
          }
          if (status === 'completed') return { ...inv, status: 'completed' as const };
          return inv;
        });
        const companyPurchases = get().companyPurchases.map((p) => {
          if (p.purchaseOrderId !== id) return p;
          if (status === 'cancelled') return { ...p, status: 'cancelled' as const };
          if (p.status === 'cancelled') return p;
          if (status === 'completed') return { ...p, status: 'completed' as const };
          return p;
        });
        set({
          purchaseOrders,
          purchaseInvoices,
          companyPurchases,
          suppliers: recalcSupplier(
            get().suppliers,
            purchaseInvoices,
            companyPurchases,
            order.supplierId
          ),
        });
      },

      createCompanyPurchaseFromOrder: (input) => {
        const order = get().purchaseOrders.find((o) => o.id === input.purchaseOrderId);
        if (!order || order.status === 'cancelled') return null;
        if (get().companyPurchases.some((p) => p.purchaseOrderId === order.id && p.status !== 'cancelled')) {
          return null;
        }
        const invoice = get().purchaseInvoices.find((i) => i.purchaseOrderId === order.id);
        const id = nextId(get().companyPurchases);
        const qty = Number(input.qty || order.qty);
        const amount = qty * order.unitPrice;
        const freight = Number(input.freight || 0);
        const otherCosts = Number(input.otherCosts || 0);
        const paid = Number(input.paid || 0);
        const total = amount + freight + otherCosts;
        const row: CompanyPurchase = {
          id,
          purchaseOrderId: order.id,
          invoiceId: invoice?.id ?? 0,
          poCode: order.code,
          number: `CP-${pad(id)}`,
          date: input.date || order.date,
          seller: order.supplier,
          supplierId: order.supplierId,
          product: order.product,
          productCode: order.productCode,
          qty,
          unit: order.unit,
          rate: order.unitPrice,
          amount,
          currency: order.currency,
          freight,
          otherCosts,
          paid,
          balance: Math.max(0, total - paid),
          location: input.location,
          contract: input.contract,
          company: order.company,
          status: order.status === 'pending' ? 'approved' : order.status,
          notes: input.notes,
        };
        const purchaseOrders = get().purchaseOrders.map((o) =>
          o.id === order.id && o.status === 'pending' ? { ...o, status: 'approved' as const } : o
        );
        const purchaseInvoices = get().purchaseInvoices.map((inv) => {
          if (inv.purchaseOrderId !== order.id) return inv;
          const nextPaid = paid || inv.paid;
          const nextAmount = total || inv.amount;
          return {
            ...inv,
            companyPurchaseId: id,
            amount: nextAmount,
            qty,
            paid: nextPaid,
            balance: Math.max(0, nextAmount - nextPaid),
            status: inv.status === 'pending' ? ('approved' as const) : inv.status,
          };
        });
        const companyPurchases = [row, ...get().companyPurchases];
        set({
          purchaseOrders,
          purchaseInvoices,
          companyPurchases,
          suppliers: recalcSupplier(
            get().suppliers,
            purchaseInvoices,
            companyPurchases,
            order.supplierId
          ),
        });
        return row;
      },

      updatePurchaseInvoice: (id, patch) => {
        const current = get().purchaseInvoices.find((i) => i.id === id);
        if (!current) return;
        const paid = patch.paid ?? current.paid;
        const amount = patch.amount ?? current.amount;
        const next: PurchaseInvoice = {
          ...current,
          ...patch,
          paid,
          amount,
          balance: Math.max(0, amount - paid),
        };
        const purchaseInvoices = get().purchaseInvoices.map((i) => (i.id === id ? next : i));
        let purchaseOrders = get().purchaseOrders;
        let companyPurchases = get().companyPurchases;
        if (next.status === 'cancelled' || next.status === 'completed') {
          purchaseOrders = purchaseOrders.map((o) =>
            o.id === next.purchaseOrderId ? { ...o, status: next.status } : o
          );
          companyPurchases = companyPurchases.map((p) =>
            p.purchaseOrderId === next.purchaseOrderId ? { ...p, status: next.status } : p
          );
        }
        if (next.status === 'approved') {
          purchaseOrders = purchaseOrders.map((o) =>
            o.id === next.purchaseOrderId && o.status === 'pending'
              ? { ...o, status: 'approved' }
              : o
          );
        }
        companyPurchases = companyPurchases.map((p) =>
          p.invoiceId === id || p.purchaseOrderId === next.purchaseOrderId
            ? { ...p, paid: next.paid, balance: Math.max(0, p.amount + p.freight + p.otherCosts - next.paid) }
            : p
        );
        set({
          purchaseInvoices,
          purchaseOrders,
          companyPurchases,
          suppliers: recalcSupplier(
            get().suppliers,
            purchaseInvoices,
            companyPurchases,
            next.supplierId
          ),
        });
      },

      addWarehouse: (input) => {
        const row: WarehouseEntity = { ...input, id: nextId(get().warehouseEntities) };
        set({ warehouseEntities: [row, ...get().warehouseEntities] });
        return row;
      },
      updateWarehouse: (id, patch) =>
        set({
          warehouseEntities: get().warehouseEntities.map((w) =>
            w.id === id ? { ...w, ...patch } : w
          ),
        }),
      removeWarehouse: (id) =>
        set({
          warehouseEntities: get().warehouseEntities.filter((w) => w.id !== id),
          stockLots: get().stockLots.filter((l) => l.warehouseId !== id),
          storageCashEntries: get().storageCashEntries.filter((e) => e.warehouseId !== id),
          storageGoodsMoves: get().storageGoodsMoves.filter((e) => e.warehouseId !== id),
          wagonRentStays: get().wagonRentStays.filter((e) => e.warehouseId !== id),
        }),

      receiveToWarehouse: (input) => {
        const wh = get().warehouseEntities.find((w) => w.id === input.warehouseId);
        if (!wh || input.qty <= 0) return null;
        const unitPrice = Number(input.unitPrice || 0);
        const existing = get().stockLots.find(
          (l) =>
            l.warehouseId === input.warehouseId &&
            l.productCode === input.productCode &&
            l.contractId === input.contractId &&
            (l.partyId ?? 0) === (input.partyId ?? 0) &&
            Number(l.unitPrice || 0) === unitPrice &&
            (l.status || 'active') === 'active'
        );
        if (existing) {
          const stockLots = get().stockLots.map((l) =>
            l.id === existing.id
              ? { ...l, qty: l.qty + input.qty, qtyOriginal: l.qtyOriginal + input.qty }
              : l
          );
          set({ stockLots });
          return { ...existing, qty: existing.qty + input.qty };
        }
        const lot: StockLot = {
          id: nextId(get().stockLots),
          warehouseId: wh.id,
          warehouseName: wh.name,
          productCode: input.productCode,
          productName: input.productName,
          unit: input.unit,
          qty: input.qty,
          qtyOriginal: input.qty,
          unitPrice,
          reserved: 0,
          contractId: input.contractId,
          contractNumber: input.contractNumber,
          partyId: input.partyId,
          partyNumber: input.partyNumber,
          supplierName: input.supplierName,
          company: input.company,
          receivedDate: todayIso(),
          status: 'active',
          notes: input.notes || '',
        };
        set({ stockLots: [lot, ...get().stockLots] });
        return lot;
      },

      sellFromLot: (lotId, qty) => {
        const lot = get().stockLots.find((l) => l.id === lotId);
        if (!lot || qty <= 0 || qty > lot.qty || (lot.status && lot.status !== 'active')) return false;
        const nextQty = lot.qty - qty;
        let stockLots = get().stockLots.map((l) => {
          if (l.id !== lotId) return l;
          if (nextQty <= 0) return { ...l, qty: 0, status: 'depleted' as const };
          return { ...l, qty: nextQty };
        });
        if (nextQty <= 0) {
          stockLots = stockLots.filter((l) => l.id !== lotId || l.qty > 0);
        }
        let parties = get().lists.parties ?? [];
        if (lot.partyId) {
          parties = patchPartyRow(parties, lot.partyId, (raw) =>
            partyPatchAfterLoad(raw, qty)
          );
          parties = afterLotDepleted(parties, stockLots, lot.partyId);
        }
        set({ stockLots, lists: { ...get().lists, parties } });
        return true;
      },

      sellToCustomer: (input) => {
        const customer = get().customers.find((c) => c.id === input.customerId);
        if (!customer || input.qty <= 0 || input.unitPrice < 0) return null;
        if (input.stockLotId) {
          const ok = get().sellFromLot(input.stockLotId, input.qty);
          if (!ok) return null;
        }
        const amount = input.qty * input.unitPrice;
        const lot: CustomerGoodsLot = {
          id: nextId(get().customerGoodsLots),
          customerId: customer.id,
          customerName: customer.name,
          productCode: input.productCode,
          productName: input.productName,
          unit: input.unit,
          qtyOriginal: input.qty,
          qtyRemaining: input.qty,
          unitPrice: input.unitPrice,
          date: input.date,
          company: input.company,
          notes: input.notes || '',
          warehouse: input.warehouse,
        };
        const details =
          input.details ||
          `فروش ${input.qty} ${input.unit} ${input.productName} فی ${input.unitPrice} دالر`;
        set({
          customerGoodsLots: [lot, ...get().customerGoodsLots],
          customers: patchCustomerBalances(
            get().customers,
            customer.id,
            input.company,
            input.productCode,
            input.qty,
            -amount,
            input.date
          ),
          customerLedgers: appendCustomerLedger(get().customerLedgers, customer.id, {
            dateJalali: jalaliFromIso(input.date),
            dateGregorian: input.date,
            party: customer.name,
            details,
            product: input.productName,
            qty: input.qty,
            unitPrice: input.unitPrice,
            loading: 0,
            totalPrice: amount,
            receipt: 0,
            warehouse: input.warehouse || '',
            notes: input.notes || '',
            company: input.company,
            txnType: 'purchase',
            goodsDelta: input.qty,
            cashDelta: -amount,
          }),
        });
        return lot;
      },

      resellFromCustomer: (input) => {
        const sourceLot = get().customerGoodsLots.find((l) => l.id === input.sourceLotId);
        const target = get().customers.find((c) => c.id === input.targetCustomerId);
        if (!sourceLot || !target) return null;
        if (target.id === sourceLot.customerId) return null;
        if (input.qty <= 0 || input.qty > sourceLot.qtyRemaining) return null;
        const source = get().customers.find((c) => c.id === sourceLot.customerId);
        if (!source) return null;

        const sourceAmount = input.qty * sourceLot.unitPrice;
        const resaleAmount = input.qty * input.resaleUnitPrice;
        const profitPerUnit = input.resaleUnitPrice - sourceLot.unitPrice;
        const remaining = sourceLot.qtyRemaining - input.qty;
        const targetLot: CustomerGoodsLot = {
          id: nextId(get().customerGoodsLots),
          customerId: target.id,
          customerName: target.name,
          productCode: sourceLot.productCode,
          productName: sourceLot.productName,
          unit: sourceLot.unit,
          qtyOriginal: input.qty,
          qtyRemaining: input.qty,
          unitPrice: input.resaleUnitPrice,
          date: input.date,
          company: sourceLot.company,
          notes: input.notes || '',
        };
        const resale: GoodsResale = {
          id: nextId(get().goodsResales),
          sourceLotId: sourceLot.id,
          sourceCustomerId: source.id,
          sourceCustomerName: source.name,
          targetCustomerId: target.id,
          targetCustomerName: target.name,
          productCode: sourceLot.productCode,
          productName: sourceLot.productName,
          unit: sourceLot.unit,
          qty: input.qty,
          sourceUnitPrice: sourceLot.unitPrice,
          resaleUnitPrice: input.resaleUnitPrice,
          profitPerUnit,
          totalProfit: profitPerUnit * input.qty,
          date: input.date,
          details:
            input.details ||
            `استرداد ${input.qty} ${sourceLot.unit} از ${source.name} و فروش به ${target.name} فی ${input.resaleUnitPrice}`,
          company: sourceLot.company,
        };

        let lots = get().customerGoodsLots.map((l) =>
          l.id === sourceLot.id ? { ...l, qtyRemaining: remaining } : l
        );
        lots = [targetLot, ...lots];

        let ledgers = appendCustomerLedger(get().customerLedgers, source.id, {
          dateJalali: jalaliFromIso(input.date),
          dateGregorian: input.date,
          party: target.name,
          details: resale.details,
          product: sourceLot.productName,
          qty: input.qty,
          unitPrice: sourceLot.unitPrice,
          loading: input.qty,
          totalPrice: -sourceAmount,
          receipt: 0,
          warehouse: '',
          notes: input.notes || '',
          company: sourceLot.company,
          txnType: 'takeback',
          relatedCustomerId: target.id,
          relatedCustomerName: target.name,
          sourceUnitPrice: sourceLot.unitPrice,
          goodsDelta: -input.qty,
          cashDelta: sourceAmount,
        });
        ledgers = appendCustomerLedger(ledgers, target.id, {
          dateJalali: jalaliFromIso(input.date),
          dateGregorian: input.date,
          party: source.name,
          details: resale.details,
          product: sourceLot.productName,
          qty: input.qty,
          unitPrice: input.resaleUnitPrice,
          loading: 0,
          totalPrice: resaleAmount,
          receipt: 0,
          warehouse: '',
          notes: input.notes || '',
          company: sourceLot.company,
          txnType: 'resale',
          relatedCustomerId: source.id,
          relatedCustomerName: source.name,
          sourceUnitPrice: sourceLot.unitPrice,
          goodsDelta: input.qty,
          cashDelta: -resaleAmount,
        });

        let customers = patchCustomerBalances(
          get().customers,
          source.id,
          sourceLot.company,
          sourceLot.productCode,
          -input.qty,
          sourceAmount,
          input.date
        );
        customers = patchCustomerBalances(
          customers,
          target.id,
          sourceLot.company,
          sourceLot.productCode,
          input.qty,
          -resaleAmount,
          input.date
        );

        set({
          customerGoodsLots: lots,
          goodsResales: [resale, ...get().goodsResales],
          customerLedgers: ledgers,
          customers,
        });
        return resale;
      },

      recordCustomerCashTxn: (input) => {
        const customer = get().customers.find((c) => c.id === input.customerId);
        const amount = Number(input.amount);
        if (!customer || amount <= 0) return false;
        const cashDelta = input.txnType === 'receipt' ? amount : -amount;
        const details =
          input.details ||
          (input.txnType === 'receipt'
            ? `رسید نقدی ${amount} از ${customer.name}`
            : `پرداخت ${amount} به ${customer.name}`);
        set({
          customers: patchCustomerBalances(
            get().customers,
            customer.id,
            input.company,
            '',
            0,
            cashDelta,
            input.date
          ),
          customerLedgers: appendCustomerLedger(get().customerLedgers, customer.id, {
            dateJalali: jalaliFromIso(input.date),
            dateGregorian: input.date,
            party: customer.name,
            details,
            product: '',
            qty: 0,
            unitPrice: 0,
            loading: 0,
            totalPrice: input.txnType === 'payment' ? amount : 0,
            receipt: input.txnType === 'receipt' ? amount : 0,
            warehouse: '',
            notes: input.notes || '',
            company: input.company,
            txnType: input.txnType,
            goodsDelta: 0,
            cashDelta,
          }),
        });
        return true;
      },

      addExpenseAccount: (input) => {
        const row: ExpenseAccount = { ...input, id: nextId(get().expenseAccounts) };
        set({ expenseAccounts: [row, ...get().expenseAccounts] });
        return row;
      },

      addExpenseEntry: (input) => {
        if (input.contractId) {
          const contract = get().contracts.find((c) => c.id === input.contractId);
          if (contract && !isContractOpenForExpenses(contract.status)) return null;
        }
        if (input.partyId) {
          const party = (get().lists.parties ?? []).find((p) => Number(p.id) === input.partyId);
          if (party && !isPartyOpenForExpenses(String(party.status || 'active'))) return null;
          const lot = get().stockLots.find(
            (l) => l.partyId === input.partyId && (l.status || 'active') === 'active' && l.qty > 0
          );
          if (!lot && input.book === 'goods') return null;
        }
        const row: ExpenseEntry = { ...input, id: nextId(get().expenseEntries) };
        const lists = get().lists;
        const journal = makeJournalRow(lists, {
          dateIso: input.date,
          giver: input.counterparty,
          receiver: input.expenseType,
          details: input.details,
          amount: Number(input.taken || 0) || Number(input.given || 0),
          opType: 'expense',
          company: input.company,
          links: {
            expenseId: row.id,
            ...(input.contractId ? { contractId: input.contractId } : {}),
            ...(input.partyId ? { partyId: input.partyId } : {}),
          },
        });
        set({
          expenseEntries: [row, ...get().expenseEntries],
          lists: { ...lists, journal: [journal, ...(lists.journal ?? [])] },
        });
        return row;
      },

      removeExpenseEntry: (id) =>
        set({ expenseEntries: get().expenseEntries.filter((e) => e.id !== id) }),

      addStorageCashEntry: (input) => {
        const row: StorageCashEntry = { ...input, id: nextId(get().storageCashEntries) };
        set({ storageCashEntries: [...get().storageCashEntries, row] });
        return row;
      },

      addStorageGoodsMove: (input) => {
        const { stockLotId, ...rest } = input;
        if (rest.kind === 'load' && stockLotId) {
          const lot = get().stockLots.find((l) => l.id === stockLotId);
          if (!lot || (lot.status && lot.status !== 'active')) return null;
          const ok = get().sellFromLot(stockLotId, rest.qty);
          if (!ok) return null;
        }
        let parties = get().lists.parties ?? [];
        if (rest.kind === 'unload' && rest.partyId) {
          parties = patchPartyRow(parties, rest.partyId, (raw) =>
            partyPatchAfterUnload(raw, {
              qty: rest.qty,
              wagons: rest.wagons,
              shortageQty: rest.shortageQty,
              wasteQty: rest.wasteQty,
            })
          );
        }
        const row: StorageGoodsMove = { ...rest, id: nextId(get().storageGoodsMoves) };
        const warehouse = get().warehouseEntities.find((w) => w.id === rest.warehouseId);
        const baseLists = get().lists;
        const isUnload = rest.kind === 'unload';
        const journal = makeJournalRow({ ...baseLists, parties }, {
          dateIso: rest.date,
          giver: isUnload ? rest.counterparty || rest.partyLabel : warehouse?.name || '',
          receiver: isUnload ? warehouse?.name || '' : rest.counterparty || rest.partyLabel,
          details: rest.details,
          qty: rest.qty,
          unit: rest.unit,
          opType: isUnload ? 'unload' : rest.kind === 'load' ? 'loading' : 'goods_report',
          company: rest.company,
          links: {
            warehouseId: rest.warehouseId,
            ...(rest.contractId ? { contractId: rest.contractId } : {}),
            ...(rest.partyId ? { partyId: rest.partyId } : {}),
          },
        });
        set({
          storageGoodsMoves: [...get().storageGoodsMoves, row],
          lists: {
            ...baseLists,
            parties,
            journal: [journal, ...(baseLists.journal ?? [])],
          },
          stockLots: get().stockLots,
        });
        return row;
      },

      addWagonRentStay: (input) => {
        const row: WagonRentStay = {
          ...input,
          id: nextId(get().wagonRentStays),
          status: 'open',
        };
        set({ wagonRentStays: [row, ...get().wagonRentStays] });
        return row;
      },

      settleWagonRent: (stayId, rentEndDate) => {
        const stay = get().wagonRentStays.find((s) => s.id === stayId);
        if (!stay || stay.status === 'settled') return null;
        const warehouse = get().warehouseEntities.find((w) => w.id === stay.warehouseId);
        const end = rentEndDate || stay.rentEndDate || todayIso();
        const closed: WagonRentStay = { ...stay, rentEndDate: end, status: 'settled' };
        const { days, amount } = accrueWagonRent(closed, end);
        if (amount <= 0) {
          set({
            wagonRentStays: get().wagonRentStays.map((s) => (s.id === stayId ? closed : s)),
          });
          return null;
        }
        const cash: StorageCashEntry = {
          id: nextId(get().storageCashEntries),
          warehouseId: stay.warehouseId,
          date: stay.date,
          rentEndDate: end,
          counterparty: 'کرایه واگن',
          details: wagonRentDetails(closed, warehouse?.name || 'ذخیره', days, amount),
          taken: 0,
          given: amount,
          location: stay.location || warehouse?.location || '',
          productType: stay.productType,
          notes: stay.notes,
          company: stay.company,
          wagonStayId: stay.id,
        };
        closed.settledEntryId = cash.id;
        set({
          wagonRentStays: get().wagonRentStays.map((s) => (s.id === stayId ? closed : s)),
          storageCashEntries: [...get().storageCashEntries, cash],
        });
        return cash;
      },

      setPartyStatus: (partyId, status) => {
        const parties = patchPartyRow(get().lists.parties ?? [], partyId, () => ({ status }));
        let stockLots = get().stockLots;
        if (status === 'inactive') {
          stockLots = stockLots.map((l) =>
            l.partyId === partyId ? { ...l, status: 'inactive' as const } : l
          );
        }
        set({ lists: { ...get().lists, parties }, stockLots });
      },

      setStockLotStatus: (lotId, status) => {
        const lot = get().stockLots.find((l) => l.id === lotId);
        let stockLots = get().stockLots.map((l) => (l.id === lotId ? { ...l, status } : l));
        let parties = get().lists.parties ?? [];
        if (lot?.partyId && status === 'inactive') {
          parties = patchPartyRow(parties, lot.partyId, () => ({ status: 'inactive' }));
        }
        if (lot?.partyId && status === 'active') {
          parties = patchPartyRow(parties, lot.partyId, () => ({ status: 'active' }));
        }
        set({ stockLots, lists: { ...get().lists, parties } });
      },
    }),
    {
      name: 'erp-ops-v2',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<OpsState>;
        return {
          ...current,
          ...p,
          purchaseOrders: p.purchaseOrders ?? [],
          purchaseInvoices: p.purchaseInvoices ?? [],
          companyPurchases: p.companyPurchases ?? [],
          warehouseEntities: (p.warehouseEntities ?? []).map((w) => ({
            ...w,
            capacityUnit: w.capacityUnit || 'تن',
            port: w.port || w.location || '',
          })),
          stockLots: (p.stockLots ?? []).map((l) => ({
            ...l,
            qtyOriginal: l.qtyOriginal ?? l.qty ?? 0,
            unitPrice: l.unitPrice ?? 0,
            status: l.status ?? 'active',
          })),
          customerLedgers: p.customerLedgers ?? {},
          customerGoodsLots: p.customerGoodsLots ?? [],
          goodsResales: p.goodsResales ?? [],
          expenseAccounts: p.expenseAccounts ?? [],
          expenseEntries: p.expenseEntries ?? [],
          storageCashEntries: p.storageCashEntries ?? [],
          storageGoodsMoves: p.storageGoodsMoves ?? [],
          wagonRentStays: p.wagonRentStays ?? [],
          exchangeTxns: p.exchangeTxns ?? [],
          contractPayments: p.contractPayments ?? [],
          contracts: (p.contracts ?? []).map((c) => ({
            ...c,
            paidAmount: Number(c.paidAmount || 0),
          })),
          customers: p.customers ?? [],
          suppliers: p.suppliers ?? [],
          representatives: p.representatives ?? [],
          lists: p.lists ?? {},
          crud: p.crud ?? {},
        };
      },
    }
  )
);

export function emptyContract(company: CompanyKey = 'arya'): Omit<ContractRecord, 'id'> {
  return {
    number: '',
    supplierName: '',
    supplierId: 0,
    product: 'دیزل',
    productCode: 'DIESEL',
    unit: 'تن',
    totalQty: 0,
    arrived: 0,
    unloaded: 0,
    sold: 0,
    shortage: 0,
    waste: 0,
    sellable: 0,
    transit: 0,
    location: '',
    company,
    pricePerUnit: 0,
    paidAmount: 0,
    status: 'active',
    wagons: 0,
    notes: '',
  };
}
