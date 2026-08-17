'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CrudRow } from '@/components/shared/crud-page';
import type { CompanyKey, ContractRecord, CustomerRecord, SupplierRecord } from '@/lib/demo-data';

export type OpsRow = Record<string, unknown> & {
  id: number;
};

type OpsState = {
  contracts: ContractRecord[];
  customers: CustomerRecord[];
  suppliers: SupplierRecord[];
  lists: Record<string, OpsRow[]>;
  crud: Record<string, CrudRow[]>;
  addContract: (input: Omit<ContractRecord, 'id'>) => ContractRecord;
  updateContract: (id: number, patch: Partial<ContractRecord>) => void;
  removeContract: (id: number) => void;
  setCustomers: (rows: CustomerRecord[]) => void;
  setSuppliers: (rows: SupplierRecord[]) => void;
  getList: (key: string) => OpsRow[];
  setList: (key: string, rows: OpsRow[]) => void;
  addToList: (key: string, row: Omit<OpsRow, 'id'> & { id?: number }) => OpsRow;
  getCrud: (key: string) => CrudRow[] | undefined;
  setCrud: (key: string, rows: CrudRow[]) => void;
};

export function nextId(rows: Array<{ id?: number }>) {
  return rows.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
}

export const useOpsStore = create<OpsState>()(
  persist(
    (set, get) => ({
      contracts: [],
      customers: [],
      suppliers: [],
      lists: {},
      crud: {},
      addContract: (input) => {
        const row: ContractRecord = { ...input, id: nextId(get().contracts) };
        set({ contracts: [row, ...get().contracts] });
        return row;
      },
      updateContract: (id, patch) =>
        set({
          contracts: get().contracts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }),
      removeContract: (id) =>
        set({ contracts: get().contracts.filter((c) => c.id !== id) }),
      setCustomers: (customers) => set({ customers }),
      setSuppliers: (suppliers) => set({ suppliers }),
      getList: (key) => get().lists[key] ?? [],
      setList: (key, rows) => set({ lists: { ...get().lists, [key]: rows } }),
      addToList: (key, row) => {
        const prev = get().lists[key] ?? [];
        const next: OpsRow = { ...row, id: row.id ?? nextId(prev) };
        const rows = [next, ...prev];
        set({ lists: { ...get().lists, [key]: rows } });
        return next;
      },
      getCrud: (key) => get().crud[key],
      setCrud: (key, rows) => set({ crud: { ...get().crud, [key]: rows } }),
    }),
    { name: 'erp-ops-v2' }
  )
);

export function emptyContract(company: CompanyKey = 'arya'): Omit<ContractRecord, 'id'> {
  return {
    number: '',
    supplierName: '',
    supplierId: 0,
    product: 'دیزل',
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
    status: 'active',
    wagons: 0,
  };
}
