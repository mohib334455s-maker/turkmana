'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useCompanyStore } from '@/lib/company-store';
import type { CompanyKey } from '@/lib/demo-data';
import { useOpsStore } from '@/lib/ops-store';
import { useProductCatalog } from '@/lib/product-catalog';
import { todayIso } from '@/lib/purchase-flow';
import { useI18n } from '@/lib/i18n/store';
import { formatCurrency, formatNumber } from '@/lib/utils';

function activeCompany(filter: string): CompanyKey {
  return filter === 'turkmen' ? 'turkmen' : 'arya';
}

export function CustomerSaleDialog({
  open,
  onClose,
  customerId,
}: {
  open: boolean;
  onClose: () => void;
  customerId: number;
}) {
  const { tx } = useI18n();
  const { company } = useCompanyStore();
  const catalog = useProductCatalog();
  const lots = useOpsStore((s) => s.stockLots);
  const sellToCustomer = useOpsStore((s) => s.sellToCustomer);
  const [productCode, setProductCode] = useState(catalog[0]?.code ?? '');
  const [qty, setQty] = useState('100');
  const [unitPrice, setUnitPrice] = useState('1300');
  const [date, setDate] = useState(todayIso());
  const [warehouse, setWarehouse] = useState('');
  const [stockLotId, setStockLotId] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const product = catalog.find((p) => p.code === productCode) ?? catalog[0];
  const matchingLots = lots.filter((l) => l.productCode === productCode && l.qty > 0);

  const save = () => {
    setError('');
    const q = Number(qty);
    const price = Number(unitPrice);
    if (!product || q <= 0 || price < 0) {
      setError(tx('مقدار و فیات را درست وارد کنید.', 'Enter a valid quantity and rate.'));
      return;
    }
    const lot = sellToCustomer({
      customerId,
      productCode: product.code,
          productName: product.name,
      unit: product.unit,
      qty: q,
      unitPrice: price,
      date,
      company: activeCompany(company),
      details,
      warehouse,
      stockLotId: Number(stockLotId || 0) || undefined,
    });
    if (!lot) {
      setError(tx('فروش ثبت نشد. موجودی انبار کافی نیست یا مشتری نامعتبر است.', 'Sale failed. Check warehouse stock or customer.'));
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tx('فروش کالا به مشتری', 'Sell goods to customer')}
      description={tx(
        'مثلاً ۱۰۰ تن به حاجی احمد فی تن ۱۳۰۰ دالر. این مقدار روی حساب جنسی مشتری می‌ماند و بعداً قابل فروش مجدد است.',
        'E.g. 100 tons to Haji Ahmad at $1,300/ton. That stock stays on the customer and can later be resold.'
      )}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {tx('انصراف', 'Cancel')}
          </Button>
          <Button type="button" onClick={save}>
            {tx('ثبت فروش', 'Save sale')}
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{tx('جنس', 'Product')}</Label>
          <Select value={productCode} onChange={(e) => setProductCode(e.target.value)}>
            {catalog.map((p) => (
              <option key={p.code} value={p.code}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{tx('تاریخ', 'Date')}</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{tx('مقدار', 'Quantity')} {product ? `(${product.unit})` : ''}</Label>
          <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>{tx('فیات فی واحد (دالر)', 'Rate per unit (USD)')}</Label>
          <Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{tx('از لات انبار (اختیاری)', 'Warehouse lot (optional)')}</Label>
          <Select value={stockLotId} onChange={(e) => setStockLotId(e.target.value)}>
            <option value="">{tx('بدون کسر از انبار', 'Do not deduct warehouse')}</option>
            {matchingLots.map((l) => (
              <option key={l.id} value={String(l.id)}>
                {l.warehouseName} · {l.contractNumber} · {formatNumber(l.qty, 3)} {l.unit}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{tx('گدام / محل', 'Warehouse / place')}</Label>
          <Input value={warehouse} onChange={(e) => setWarehouse(e.target.value)} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{tx('تفصیلات', 'Details')}</Label>
          <Input value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {tx('جمله', 'Amount')}: {formatCurrency(Number(qty || 0) * Number(unitPrice || 0))}
      </p>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </Dialog>
  );
}

export function CustomerResaleDialog({
  open,
  onClose,
  sourceCustomerId,
}: {
  open: boolean;
  onClose: () => void;
  sourceCustomerId: number;
}) {
  const { tx } = useI18n();
  const customers = useOpsStore((s) => s.customers);
  const lots = useOpsStore((s) => s.customerGoodsLots);
  const resellFromCustomer = useOpsStore((s) => s.resellFromCustomer);
  const sourceLots = useMemo(
    () => lots.filter((l) => l.customerId === sourceCustomerId && l.qtyRemaining > 0),
    [lots, sourceCustomerId]
  );

  const [lotId, setLotId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [date, setDate] = useState(todayIso());
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const lot = sourceLots.find((l) => l.id === Number(lotId));
  const profit = lot && Number(qty) > 0 && Number(rate) > 0
    ? (Number(rate) - lot.unitPrice) * Number(qty)
    : 0;

  const save = () => {
    setError('');
    if (!lot) {
      setError(tx('یک لات موجودی مشتری را انتخاب کنید.', 'Pick a customer stock lot.'));
      return;
    }
    const q = Number(qty);
    const newRate = Number(rate);
    if (q <= 0 || q > lot.qtyRemaining) {
      setError(tx(`مقدار باید بین ۰ و ${lot.qtyRemaining} باشد.`, `Quantity must be between 0 and ${lot.qtyRemaining}.`));
      return;
    }
    if (!Number(targetId)) {
      setError(tx('مشتری جدید را انتخاب کنید.', 'Pick the new customer.'));
      return;
    }
    const row = resellFromCustomer({
      sourceLotId: lot.id,
      targetCustomerId: Number(targetId),
      qty: q,
      resaleUnitPrice: newRate,
      date,
      details,
    });
    if (!row) {
      setError(tx('فروش مجدد ثبت نشد.', 'Resale failed.'));
      return;
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={tx('فروش مجدد از موجودی مشتری', 'Resell from customer stock')}
      description={tx(
        'از جمع جنسی که قبلاً فروخته‌اید بخشی را به نرخ دیگر برای مشتری دیگر می‌فروشید. مثال: از ۱۰۰ تن حاجی احمد، ۲۵ تن فی ۱۳۱۰.',
        'Take part of goods already sold to this customer and sell it to someone else at a new rate.'
      )}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            {tx('انصراف', 'Cancel')}
          </Button>
          <Button type="button" onClick={save}>
            {tx('ثبت فروش مجدد', 'Save resale')}
          </Button>
        </>
      }
    >
      {sourceLots.length === 0 ? (
        <p className="text-sm text-slate-500">
          {tx(
            'این مشتری موجودی قابل فروش مجدد ندارد. اول فروش کالا ثبت کنید.',
            'This customer has no remaining stock to resell. Record a sale first.'
          )}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{tx('موجودی مشتری (لات)', 'Customer stock lot')}</Label>
            <Select
              value={lotId}
              onChange={(e) => {
                setLotId(e.target.value);
                const next = sourceLots.find((l) => l.id === Number(e.target.value));
                if (next) {
                  setQty(String(next.qtyRemaining));
                  setRate(String(next.unitPrice));
                }
              }}
            >
              <option value="">{tx('انتخاب کنید', 'Select')}</option>
              {sourceLots.map((l) => (
                <option key={l.id} value={String(l.id)}>
                  {l.productName} · {formatNumber(l.qtyRemaining, 3)} {l.unit} {tx('باقی', 'left')} ·{' '}
                  {tx('فی', 'at')} {formatCurrency(l.unitPrice)}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{tx('فروش به مشتری', 'Sell to customer')}</Label>
            <Select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
              <option value="">{tx('انتخاب کنید', 'Select')}</option>
              {customers
                .filter((c) => c.id !== sourceCustomerId)
                .map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{tx('مقدار استرداد', 'Takeback qty')}</Label>
            <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            {lot ? (
              <p className="text-xs text-slate-500">
                {tx('سقف', 'Max')}: {formatNumber(lot.qtyRemaining, 3)} {lot.unit}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>{tx('نرخ جدید فی واحد', 'New rate per unit')}</Label>
            <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} />
            {lot ? (
              <p className="text-xs text-slate-500">
                {tx('نرخ قبلی', 'Original rate')}: {formatCurrency(lot.unitPrice)}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label>{tx('تاریخ', 'Date')}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{tx('تفصیلات', 'Details')}</Label>
            <Input value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
        </div>
      )}
      {lot && Number(qty) > 0 ? (
        <div className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <p>
            {tx('سود / ضرر شرکت', 'Company profit / loss')}: {formatCurrency(profit)}
          </p>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </Dialog>
  );
}
