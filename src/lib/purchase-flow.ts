import type { CompanyKey } from '@/lib/demo-data';

export type PurchaseStatus = 'pending' | 'approved' | 'completed' | 'cancelled';

export const PURCHASE_STATUSES: PurchaseStatus[] = [
  'pending',
  'approved',
  'completed',
  'cancelled',
];

export const PURCHASE_STATUS_META: Record<
  PurchaseStatus,
  { fa: string; en: string; variant: 'warning' | 'info' | 'success' | 'danger' }
> = {
  pending: { fa: 'در انتظار', en: 'Pending', variant: 'warning' },
  approved: { fa: 'تأیید شده', en: 'Approved', variant: 'info' },
  completed: { fa: 'تکمیل', en: 'Completed', variant: 'success' },
  cancelled: { fa: 'لغو', en: 'Cancelled', variant: 'danger' },
};

export type PurchaseOrder = {
  id: number;
  code: string;
  date: string;
  expectedDate: string;
  supplier: string;
  supplierId: number;
  product: string;
  productCode: string;
  qty: number;
  unit: string;
  unitPrice: number;
  amount: number;
  currency: string;
  company: CompanyKey;
  status: PurchaseStatus;
  notes: string;
};

export type PurchaseInvoice = {
  id: number;
  purchaseOrderId: number;
  companyPurchaseId?: number;
  poCode: string;
  code: string;
  date: string;
  dueDate: string;
  supplier: string;
  supplierId: number;
  product: string;
  qty: number;
  amount: number;
  paid: number;
  balance: number;
  currency: string;
  company: CompanyKey;
  status: PurchaseStatus;
  notes: string;
};

export type CompanyPurchase = {
  id: number;
  purchaseOrderId: number;
  invoiceId: number;
  poCode: string;
  number: string;
  date: string;
  seller: string;
  supplierId: number;
  product: string;
  productCode: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
  currency: string;
  freight: number;
  otherCosts: number;
  paid: number;
  balance: number;
  location: string;
  contract: string;
  company: CompanyKey;
  status: PurchaseStatus;
  notes: string;
};

export type GoodsStat = {
  qty: number;
  unit: string;
  amount: number;
  paid: number;
  lastDate: string;
  txnCount: number;
};

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
