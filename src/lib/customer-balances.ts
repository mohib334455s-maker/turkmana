import type { CompanyFilter } from '@/lib/company-store';
import type { CustomerRecord } from '@/lib/demo-data';
import { emptyGoods, goodsValue, products, sumGoods } from '@/lib/demo-data';
import type { CustomerLedgerRow } from '@/lib/demo-data';

export type CustomerBalanceView = {
  cashBalance: number;
  goodsBalance: number;
  goodsValue: number;
  goods: Record<string, number>;
  isDebtor: boolean;
  debtAmount: number;
  aryaCash: number;
  turkmenCash: number;
  aryaGoodsValue: number;
  turkmenGoodsValue: number;
};

export function customerGoodsQty(goods: Record<string, number>) {
  return Object.values(goods).reduce((s, v) => s + (Number(v) || 0), 0);
}

export function resolveCustomerBalances(
  customer: CustomerRecord,
  company: CompanyFilter,
  ledgerRows: CustomerLedgerRow[]
): CustomerBalanceView {
  const aryaCash = customer.companies.arya.cashBalance;
  const turkmenCash = customer.companies.turkmen.cashBalance;
  const aryaGoods = customer.companies.arya.goods ?? emptyGoods();
  const turkmenGoods = customer.companies.turkmen.goods ?? emptyGoods();

  const ledgerCash = ledgerRows.at(-1)?.cashBalance;
  const ledgerGoods = ledgerRows.at(-1)?.goodsBalance;

  let cashBalance: number;
  let goods: Record<string, number>;
  let goodsBalance: number;

  if (company === 'arya') {
    cashBalance = ledgerRows.length > 0 && ledgerCash !== undefined ? ledgerCash : aryaCash;
    goods = { ...aryaGoods };
    goodsBalance =
      ledgerRows.length > 0 && ledgerGoods !== undefined ? ledgerGoods : customerGoodsQty(goods);
  } else if (company === 'turkmen') {
    cashBalance = ledgerRows.length > 0 && ledgerCash !== undefined ? ledgerCash : turkmenCash;
    goods = { ...turkmenGoods };
    goodsBalance =
      ledgerRows.length > 0 && ledgerGoods !== undefined ? ledgerGoods : customerGoodsQty(goods);
  } else {
    cashBalance =
      ledgerRows.length > 0 && ledgerCash !== undefined ? ledgerCash : aryaCash + turkmenCash;
    goods = sumGoods(aryaGoods, turkmenGoods);
    goodsBalance =
      ledgerRows.length > 0 && ledgerGoods !== undefined ? ledgerGoods : customerGoodsQty(goods);
  }

  const goodsVal = goodsValue(goods);
  const debtAmount = cashBalance < 0 ? Math.abs(cashBalance) : 0;

  return {
    cashBalance,
    goodsBalance,
    goodsValue: goodsVal,
    goods,
    isDebtor: cashBalance < 0,
    debtAmount,
    aryaCash,
    turkmenCash,
    aryaGoodsValue: goodsValue(aryaGoods),
    turkmenGoodsValue: goodsValue(turkmenGoods),
  };
}

export function customerDebtBreakdown(customer: CustomerRecord) {
  const rows: Array<{
    company: 'arya' | 'turkmen';
    label: string;
    cash: number;
    goodsValue: number;
    debt: number;
  }> = [
    {
      company: 'arya',
      label: 'آریا',
      cash: customer.companies.arya.cashBalance,
      goodsValue: goodsValue(customer.companies.arya.goods),
      debt:
        customer.companies.arya.cashBalance < 0
          ? Math.abs(customer.companies.arya.cashBalance)
          : 0,
    },
    {
      company: 'turkmen',
      label: 'ترکمن',
      cash: customer.companies.turkmen.cashBalance,
      goodsValue: goodsValue(customer.companies.turkmen.goods),
      debt:
        customer.companies.turkmen.cashBalance < 0
          ? Math.abs(customer.companies.turkmen.cashBalance)
          : 0,
    },
  ];
  const totalDebt = rows.reduce((s, r) => s + r.debt, 0);
  const totalCash = customer.companies.arya.cashBalance + customer.companies.turkmen.cashBalance;
  return { rows, totalDebt, totalCash };
}

export function productCatalogForCustomer() {
  return products;
}
