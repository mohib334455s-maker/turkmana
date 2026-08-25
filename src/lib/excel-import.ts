/**
 * Excel template + restore mapped to ops-store / database field names.
 */
import * as XLSX from 'xlsx';

export const EXCEL_SHEETS = [
  {
    name: 'contracts',
    columns: [
      'id',
      'number',
      'supplierName',
      'supplierId',
      'product',
      'productCode',
      'unit',
      'totalQty',
      'arrived',
      'unloaded',
      'sold',
      'shortage',
      'waste',
      'sellable',
      'transit',
      'location',
      'company',
      'pricePerUnit',
      'paidAmount',
      'status',
      'wagons',
      'notes',
    ],
  },
  {
    name: 'parties',
    columns: [
      'id',
      'number',
      'contractId',
      'contractNumber',
      'location',
      'wagons',
      'qty',
      'arrived',
      'unloaded',
      'sold',
      'shortage',
      'waste',
      'sellable',
      'transit',
      'status',
    ],
  },
  {
    name: 'exchangeHouses',
    columns: [
      'id',
      'name',
      'kind',
      'currency',
      'balance',
      'location',
      'phone',
      'whatsapp',
      'contactPerson',
      'address',
      'company',
      'notes',
    ],
  },
  {
    name: 'warehouses',
    columns: ['id', 'name', 'location', 'type', 'company', 'capacity', 'notes'],
  },
  {
    name: 'customers',
    columns: [
      'id',
      'name',
      'phone',
      'location',
      'company',
      'balance',
      'currency',
      'notes',
    ],
  },
  {
    name: 'suppliers',
    columns: ['id', 'name', 'phone', 'location', 'company', 'balance', 'currency', 'notes'],
  },
  {
    name: 'journal',
    columns: [
      'id',
      'number',
      'dateJalali',
      'dateGregorian',
      'giver',
      'receiver',
      'details',
      'amount',
      'qty',
      'currency',
      'company',
      'approved',
    ],
  },
] as const;

export type ExcelSheetName = (typeof EXCEL_SHEETS)[number]['name'];

function sheetToObjects(wb: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: '',
    raw: false,
  });
  return rows.filter((row) =>
    Object.values(row).some((v) => String(v ?? '').trim() !== '')
  );
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const n = Number(String(v ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : fallback;
}

function str(v: unknown): string {
  return String(v ?? '').trim();
}

function companyKey(v: unknown): 'arya' | 'turkmen' {
  const s = str(v).toLowerCase();
  if (s.includes('turk') || s.includes('ترکمن')) return 'turkmen';
  return 'arya';
}

export function downloadExcelTemplate() {
  const wb = XLSX.utils.book_new();
  for (const def of EXCEL_SHEETS) {
    const ws = XLSX.utils.aoa_to_sheet([
      [...def.columns],
      def.columns.map(() => ''),
    ]);
    XLSX.utils.book_append_sheet(wb, ws, def.name);
  }
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `turkman-erp-template-${stamp}.xlsx`);
}

export async function importExcelFile(
  file: File
): Promise<{ ok: true; counts: Record<string, number> } | { ok: false; error: string }> {
  try {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array' });
    const raw = localStorage.getItem('erp-ops-v2');
    const state = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    const lists = {
      ...((state.lists as Record<string, unknown[]>) || {}),
    };
    const counts: Record<string, number> = {};

    const contracts = sheetToObjects(wb, 'contracts').map((r, i) => ({
      id: num(r.id, i + 1),
      number: str(r.number),
      supplierName: str(r.supplierName),
      supplierId: num(r.supplierId),
      product: str(r.product),
      productCode: str(r.productCode),
      unit: str(r.unit) || 'تن',
      totalQty: num(r.totalQty),
      arrived: num(r.arrived),
      unloaded: num(r.unloaded),
      sold: num(r.sold),
      shortage: num(r.shortage),
      waste: num(r.waste),
      sellable: num(r.sellable),
      transit: num(r.transit),
      location: str(r.location),
      company: companyKey(r.company),
      pricePerUnit: num(r.pricePerUnit),
      paidAmount: num(r.paidAmount),
      status: str(r.status) || 'فعال',
      wagons: num(r.wagons),
      notes: str(r.notes),
    }));
    if (contracts.length) {
      state.contracts = contracts;
      counts.contracts = contracts.length;
    }

    const parties = sheetToObjects(wb, 'parties').map((r, i) => ({
      id: num(r.id, i + 1),
      number: str(r.number),
      contractId: num(r.contractId),
      contractNumber: str(r.contractNumber),
      location: str(r.location),
      wagons: num(r.wagons),
      qty: num(r.qty),
      arrived: num(r.arrived),
      unloaded: num(r.unloaded),
      sold: num(r.sold),
      shortage: num(r.shortage),
      waste: num(r.waste),
      sellable: num(r.sellable),
      transit: num(r.transit),
      status: str(r.status) || 'باز',
    }));
    if (parties.length) {
      lists.parties = parties;
      counts.parties = parties.length;
    }

    const exchangeHouses = sheetToObjects(wb, 'exchangeHouses').map((r, i) => ({
      id: num(r.id, i + 1),
      name: str(r.name),
      kind: str(r.kind) || 'exchanger',
      currency: str(r.currency) || 'USD',
      balance: num(r.balance),
      location: str(r.location),
      phone: str(r.phone),
      whatsapp: str(r.whatsapp),
      contactPerson: str(r.contactPerson),
      address: str(r.address),
      company: companyKey(r.company),
      notes: str(r.notes),
    }));
    if (exchangeHouses.length) {
      lists.exchangeHouses = exchangeHouses;
      counts.exchangeHouses = exchangeHouses.length;
    }

    const warehouses = sheetToObjects(wb, 'warehouses').map((r, i) => ({
      id: num(r.id, i + 1),
      name: str(r.name),
      location: str(r.location),
      type: str(r.type) || 'مواد ارتزاقی',
      company: companyKey(r.company),
      capacity: num(r.capacity),
      notes: str(r.notes),
    }));
    if (warehouses.length) {
      state.warehouseEntities = warehouses;
      counts.warehouses = warehouses.length;
    }

    const customers = sheetToObjects(wb, 'customers').map((r, i) => ({
      id: num(r.id, i + 1),
      name: str(r.name),
      phone: str(r.phone),
      location: str(r.location),
      company: companyKey(r.company),
      balance: num(r.balance),
      currency: str(r.currency) || 'USD',
      notes: str(r.notes),
    }));
    if (customers.length) {
      state.customers = customers;
      counts.customers = customers.length;
    }

    const suppliers = sheetToObjects(wb, 'suppliers').map((r, i) => ({
      id: num(r.id, i + 1),
      name: str(r.name),
      phone: str(r.phone),
      location: str(r.location),
      company: companyKey(r.company),
      balance: num(r.balance),
      currency: str(r.currency) || 'USD',
      notes: str(r.notes),
    }));
    if (suppliers.length) {
      state.suppliers = suppliers;
      counts.suppliers = suppliers.length;
    }

    const journal = sheetToObjects(wb, 'journal').map((r, i) => ({
      id: num(r.id, i + 1),
      number: str(r.number),
      dateJalali: str(r.dateJalali),
      dateGregorian: str(r.dateGregorian),
      giver: str(r.giver),
      receiver: str(r.receiver),
      details: str(r.details),
      amount: num(r.amount),
      qty: num(r.qty),
      currency: str(r.currency) || 'USD',
      company: companyKey(r.company),
      approved: str(r.approved),
    }));
    if (journal.length) {
      lists.journal = journal;
      counts.journal = journal.length;
    }

    if (Object.keys(counts).length === 0) {
      return { ok: false, error: 'empty' };
    }

    state.lists = lists;
    localStorage.setItem('erp-ops-v2', JSON.stringify(state));
    return { ok: true, counts };
  } catch {
    return { ok: false, error: 'parse_error' };
  }
}
