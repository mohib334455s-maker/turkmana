import type { CompanyKey, CustomerLedgerRow } from '@/lib/demo-data';
import { formatJalali } from '@/lib/date-utils';

export type CustomerGoodsLot = {
  id: number;
  customerId: number;
  customerName: string;
  productCode: string;
  productName: string;
  unit: string;
  qtyOriginal: number;
  qtyRemaining: number;
  unitPrice: number;
  date: string;
  company: CompanyKey;
  notes: string;
  warehouse?: string;
};

export type GoodsResale = {
  id: number;
  sourceLotId: number;
  sourceCustomerId: number;
  sourceCustomerName: string;
  targetCustomerId: number;
  targetCustomerName: string;
  productCode: string;
  productName: string;
  unit: string;
  qty: number;
  sourceUnitPrice: number;
  resaleUnitPrice: number;
  profitPerUnit: number;
  totalProfit: number;
  date: string;
  details: string;
  company: CompanyKey;
};

export function parseIsoDate(iso: string) {
  return new Date(`${iso}T12:00:00`);
}

export function jalaliFromIso(iso: string) {
  return formatJalali(parseIsoDate(iso));
}

export function lastLedgerBalances(rows: CustomerLedgerRow[] | undefined) {
  const last = rows?.at(-1);
  return {
    goodsBalance: last?.goodsBalance ?? 0,
    cashBalance: last?.cashBalance ?? 0,
  };
}
