import type { CompanyKey } from '@/lib/demo-data';

export type ContractPayment = {
  id: number;
  contractId: number;
  contractNumber: string;
  dateIso: string;
  amount: number;
  /** Optional explicit percent of contract value (informational if amount set) */
  percent?: number;
  method?: string;
  notes?: string;
  company: CompanyKey;
};

export function contractValue(totalQty: number, pricePerUnit: number) {
  return Number(totalQty || 0) * Number(pricePerUnit || 0);
}

export function paymentProgress(value: number, paid: number) {
  const contractVal = Number(value || 0);
  const paidAmount = Number(paid || 0);
  const remaining = contractVal - paidAmount;
  const percent = contractVal > 0 ? Math.round((paidAmount / contractVal) * 1000) / 10 : 0;
  return { contractVal, paidAmount, remaining, percent };
}

export function amountFromPercent(contractVal: number, percent: number) {
  return Math.round(((Number(contractVal) || 0) * (Number(percent) || 0)) / 100 * 100) / 100;
}
