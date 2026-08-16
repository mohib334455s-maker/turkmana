export type CustomerTxnType = 'purchase' | 'loading' | 'takeback' | 'resale' | 'receipt' | 'payment';

export const customerTxnLabels: Record<CustomerTxnType, string> = {
  purchase: 'خرید کالا',
  loading: 'بارگیری',
  takeback: 'استرداد برای فروش مجدد',
  resale: 'فروش مجدد (از موجودی مشتری دیگر)',
  receipt: 'رسید نقدی',
  payment: 'پرداخت',
};

export function resaleProfitPerTon(sourcePrice: number, resalePrice: number) {
  return resalePrice - sourcePrice;
}
