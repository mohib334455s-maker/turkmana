import type { CatalogProduct } from '@/lib/product-catalog';
import type { CompanyPurchase, GoodsStat, PurchaseInvoice } from '@/lib/purchase-flow';

export function supplierGoodsStats(
  supplierId: number,
  catalog: CatalogProduct[],
  purchases: CompanyPurchase[],
  invoices: PurchaseInvoice[]
): Array<GoodsStat & { code: string; name: string }> {
  const rows = purchases.filter(
    (p) => p.supplierId === supplierId && p.status !== 'cancelled'
  );
  const inv = invoices.filter(
    (i) => i.supplierId === supplierId && i.status !== 'cancelled'
  );

  const extraCodes = new Set<string>();
  for (const p of rows) if (p.productCode) extraCodes.add(p.productCode);

  const products = [...catalog];
  for (const code of extraCodes) {
    if (!products.some((p) => p.code === code)) {
      const sample = rows.find((r) => r.productCode === code);
      products.push({
        code,
        name: sample?.product || code,
        nameEn: sample?.product || code,
        unit: sample?.unit || '',
        label: sample?.product || code,
      });
    }
  }

  return products.map((p) => {
    const matches = rows.filter((r) => r.productCode === p.code);
    const relatedInvoices = inv.filter((i) =>
      matches.some((m) => m.invoiceId === i.id || m.purchaseOrderId === i.purchaseOrderId)
    );
    const qty = matches.reduce((s, r) => s + r.qty, 0);
    const amount = matches.reduce((s, r) => s + r.amount, 0);
    const paid = relatedInvoices.reduce((s, i) => s + i.paid, 0);
    const lastDate = matches.map((r) => r.date).filter(Boolean).sort().at(-1) ?? '-';
    return {
      code: p.code,
      name: p.label,
      qty,
      unit: p.unit,
      amount,
      paid,
      lastDate,
      txnCount: matches.length,
    };
  });
}

export function supplierGoodsValue(
  supplierId: number,
  purchases: CompanyPurchase[]
) {
  return purchases
    .filter((p) => p.supplierId === supplierId && p.status !== 'cancelled')
    .reduce((s, p) => s + p.amount, 0);
}
