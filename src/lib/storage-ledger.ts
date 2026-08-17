import { differenceInCalendarDays, parseISO } from 'date-fns';
import type { CompanyKey } from '@/lib/demo-data';
import { todayIso } from '@/lib/purchase-flow';

export type StorageGoodsKind = 'unload' | 'load';

export type StorageGoodsMove = {
  id: number;
  warehouseId: number;
  date: string;
  kind: StorageGoodsKind;
  counterparty: string;
  details: string;
  productName: string;
  productCode: string;
  qty: number;
  unit: string;
  wagons?: number;
  shortageQty?: number;
  wasteQty?: number;
  unitPrice?: number;
  partyLabel: string;
  partyId?: number;
  contractId?: number;
  notes: string;
  company: CompanyKey;
};

export type StorageCashEntry = {
  id: number;
  warehouseId: number;
  date: string;
  rentEndDate: string;
  counterparty: string;
  details: string;
  taken: number;
  given: number;
  location: string;
  productType: string;
  notes: string;
  company: CompanyKey;
  wagonStayId?: number;
};

export type WagonRentStay = {
  id: number;
  warehouseId: number;
  date: string;
  rentEndDate: string;
  wagons: number;
  dailyRatePerWagon: number;
  dailyRatePerTon: number;
  freeDays: number;
  qty: number;
  unit: string;
  productType: string;
  partyLabel: string;
  partyId?: number;
  location: string;
  notes: string;
  company: CompanyKey;
  status: 'open' | 'settled';
  settledEntryId?: number;
};

/** Inclusive calendar days from start to end. Same day = 1. */
export function inclusiveDays(startIso: string, endIso: string) {
  if (!startIso || !endIso) return 0;
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, differenceInCalendarDays(end, start) + 1);
}

export function billedRentDays(startIso: string, endIso: string, freeDays = 0) {
  return Math.max(0, inclusiveDays(startIso, endIso) - Math.max(0, freeDays));
}

export function accrueWagonRent(stay: WagonRentStay, asOf = todayIso()) {
  const end = stay.status === 'settled' && stay.rentEndDate ? stay.rentEndDate : stay.rentEndDate || asOf;
  const days = billedRentDays(stay.date, end, stay.freeDays);
  const wagonPart = stay.wagons * days * Number(stay.dailyRatePerWagon || 0);
  const tonPart = Number(stay.qty || 0) * days * Number(stay.dailyRatePerTon || 0);
  return { days, amount: wagonPart + tonPart, end };
}

export function cashNet(row: Pick<StorageCashEntry, 'taken' | 'given'>) {
  return Number(row.taken || 0) - Number(row.given || 0);
}

export function runningCashBalances(rows: StorageCashEntry[]) {
  const sorted = [...rows].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.id - b.id;
  });
  let bal = 0;
  return sorted.map((row) => {
    bal += cashNet(row);
    return { ...row, balance: bal };
  });
}

export function runningGoodsBalances(rows: StorageGoodsMove[]) {
  const sorted = [...rows].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.id - b.id;
  });
  let bal = 0;
  return sorted.map((row) => {
    bal += row.kind === 'unload' ? row.qty : -row.qty;
    return { ...row, balance: bal };
  });
}

export function wagonRentDetails(stay: WagonRentStay, warehouseName: string, days: number, amount: number) {
  const qtyBit = stay.qty
    ? ` به وزن ${stay.qty} ${stay.unit}`
    : '';
  return `طلب ${warehouseName} بابت کرایه ${stay.productType || 'جنس'} از پارتی ${stay.wagons} واگن${qtyBit} — ${days} روز × ${stay.dailyRatePerWagon || 0} دالر فی واگن${
    stay.dailyRatePerTon ? ` + ${stay.dailyRatePerTon} دالر فی ${stay.unit}` : ''
  } = ${amount}`;
}
