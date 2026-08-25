'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { PurchaseStatusBadge, useCompanyName } from '@/components/purchases/purchase-status-badge';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useCompanyFormOptions } from '@/lib/use-company-form';
import { useI18n } from '@/lib/i18n/store';
import { useOpsStore } from '@/lib/ops-store';
import { useProductCatalog } from '@/lib/product-catalog';
import { todayIso } from '@/lib/purchase-flow';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';

export default function PurchaseOrdersPage() {
  const { t } = useI18n();
  const companyName = useCompanyName();
  const { company } = useCompanyStore();
  const { options: companyOptions, defaultCompany, showCompanyField } =
    useCompanyFormOptions();
  const catalog = useProductCatalog();
  const suppliers = useOpsStore((s) => s.suppliers);
  const orders = useOpsStore((s) => s.purchaseOrders);
  const invoices = useOpsStore((s) => s.purchaseInvoices);
  const purchases = useOpsStore((s) => s.companyPurchases);
  const addPurchaseOrder = useOpsStore((s) => s.addPurchaseOrder);
  const setPurchaseOrderStatus = useOpsStore((s) => s.setPurchaseOrderStatus);
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === '1') setOpen(true);
  }, [searchParams]);

  const rows = useMemo(
    () => orders.filter((o) => matchesCompany(o.company, company)),
    [orders, company]
  );

  const fields = useMemo(
    () =>
      [
        {
          key: 'supplierId',
          label: t('colSupplier'),
          type: 'select' as const,
          required: true,
          options: suppliers.map((s) => ({ value: String(s.id), label: s.name })),
        },
        {
          key: 'company',
          label: t('colCompany'),
          type: 'select' as const,
          required: true,
          options: companyOptions,
        },
        {
          key: 'productCode',
          label: t('colProduct'),
          type: 'select' as const,
          required: true,
          options: catalog.map((p) => ({ value: p.code, label: `${p.label} (${p.unit})` })),
        },
        { key: 'qty', label: t('colQty'), type: 'number' as const, required: true },
        { key: 'unitPrice', label: t('colRate'), type: 'number' as const, required: true },
        { key: 'date', label: t('colOrderDate'), type: 'date' as const, required: true },
        { key: 'expectedDate', label: t('colExpectedDate'), type: 'date' as const },
        {
          key: 'currency',
          label: t('colCurrency'),
          type: 'select' as const,
          options: [
            { value: 'USD', label: 'USD' },
            { value: 'AED', label: 'AED' },
            { value: 'AFN', label: 'AFN' },
          ],
        },
        { key: 'notes', label: t('colNotes'), type: 'text' as const },
      ].filter((f) => f.key !== 'company' || showCompanyField),
    [t, suppliers, catalog, companyOptions, showCompanyField]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <FlowLinks
        steps={PURCHASE_FLOW_STEPS.map((s) => ({
          ...s,
          active: s.href === '/dashboard/purchases',
        }))}
      />

      <PageHeader
        title={t('poTitle')}
        description={t('poDesc')}
        actions={
          <>
            <ExportButtons
              filename="purchase-orders"
              title={t('poTitle')}
              columns={[
                { key: 'code', label: t('colOrderNo') },
                { key: 'date', label: t('colOrderDate') },
                { key: 'supplier', label: t('colSupplier') },
                { key: 'product', label: t('colProduct') },
                { key: 'qty', label: t('colQty') },
                { key: 'unitPrice', label: t('colRate') },
                { key: 'amount', label: t('colApproxAmount') },
                { key: 'company', label: t('colCompany') },
                { key: 'status', label: t('colStatus') },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Button onClick={() => setOpen(true)} disabled={suppliers.length === 0 || catalog.length === 0}>
              <Plus className="ms-2 h-4 w-4" />
              {t('newPurchaseOrder')}
            </Button>
          </>
        }
      />

      <p className="text-sm text-slate-500">{t('poCreatedHint')}</p>
      {suppliers.length === 0 ? (
        <p className="text-sm text-amber-700">
          <Link href="/dashboard/suppliers?new=1" className="underline">
            {t('selectSupplierFirst')}
          </Link>
        </p>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('poTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('colOrderNo')}</TableHead>
                      <TableHead>{t('colSupplier')}</TableHead>
                      <TableHead>{t('colCompany')}</TableHead>
                      <TableHead>{t('colProduct')}</TableHead>
                      <TableHead>{t('colQty')}</TableHead>
                      <TableHead>{t('colRate')}</TableHead>
                      <TableHead>{t('colApproxAmount')}</TableHead>
                      <TableHead>{t('colOrderDate')}</TableHead>
                      <TableHead>{t('colExpectedDate')}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                      <TableHead className="text-center">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty colSpan={11} message={t('noPurchaseOrders')} />
                    ) : null}
                    {rows.map((r) => {
                      const invoice = invoices.find((i) => i.purchaseOrderId === r.id);
                      const purchase = purchases.find(
                        (p) => p.purchaseOrderId === r.id && p.status !== 'cancelled'
                      );
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-semibold num">{r.code}</TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/suppliers/${r.supplierId}`}
                              className="hover:text-teal-700"
                            >
                              {r.supplier}
                            </Link>
                          </TableCell>
                          <TableCell>{companyName(r.company)}</TableCell>
                          <TableCell>{r.product}</TableCell>
                          <TableCell className="num">
                            {formatNumber(r.qty, 0)} {r.unit}
                          </TableCell>
                          <TableCell className="num">
                            {formatCurrency(r.unitPrice, r.currency)}
                          </TableCell>
                          <TableCell className="num font-semibold">
                            {formatCurrency(r.amount, r.currency)}
                          </TableCell>
                          <TableCell className="num">{r.date}</TableCell>
                          <TableCell className="num">{r.expectedDate || '—'}</TableCell>
                          <TableCell>
                            <PurchaseStatusBadge status={r.status} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap items-center justify-end gap-1">
                              {invoice ? (
                                <Link href="/dashboard/purchases/invoices">
                                  <Badge variant="muted">{invoice.code || t('invoicePendingNo')}</Badge>
                                </Link>
                              ) : null}
                              {r.status === 'pending' ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPurchaseOrderStatus(r.id, 'approved')}
                                >
                                  {t('approve')}
                                </Button>
                              ) : null}
                              {r.status !== 'cancelled' && r.status !== 'completed' && !purchase ? (
                                <Link href={`/dashboard/purchases/company?fromOrder=${r.id}`}>
                                  <Button size="sm" variant="outline">
                                    {t('receiveGoods')}
                                  </Button>
                                </Link>
                              ) : null}
                              {r.status !== 'cancelled' && r.status !== 'completed' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setPurchaseOrderStatus(r.id, 'cancelled')}
                                >
                                  {t('cancelRecord')}
                                </Button>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">{t('noPurchaseOrders')}</p>
              ) : (
                rows.map((r) => (
                  <MobileRecordCard
                    key={r.id}
                    title={r.code}
                    subtitle={`${r.supplier} · ${r.date}`}
                    badge={<PurchaseStatusBadge status={r.status} />}
                    metrics={[
                      { label: t('colProduct'), value: r.product },
                      { label: t('colQty'), value: `${formatNumber(r.qty, 0)} ${r.unit}` },
                      { label: t('colApproxAmount'), value: formatCurrency(r.amount, r.currency) },
                      { label: t('colCompany'), value: companyName(r.company) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={t('colExpectedDate')} value={r.expectedDate || '—'} />
                        <ExtraRow label={t('colNotes')} value={r.notes || '—'} />
                      </>
                    }
                    footer={
                      r.status === 'pending' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPurchaseOrderStatus(r.id, 'approved')}
                        >
                          {t('approve')}
                        </Button>
                      ) : null
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <CompactFormDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t('newPurchaseOrder')}
        description={t('poCreatedHint')}
        fields={fields}
        initial={{
          date: todayIso(),
          expectedDate: '',
          qty: '',
          unitPrice: '',
          company: defaultCompany,
        }}
        submitLabel={t('save')}
        onSubmit={(values) => {
          const supplier = suppliers.find((s) => String(s.id) === values.supplierId);
          const product = catalog.find((p) => p.code === values.productCode);
          if (!supplier || !product) return;
          addPurchaseOrder({
            date: values.date || todayIso(),
            expectedDate: values.expectedDate || '',
            supplier: supplier.name,
            supplierId: supplier.id,
            product: product.label,
            productCode: product.code,
            qty: Number(values.qty || 0),
            unit: product.unit,
            unitPrice: Number(values.unitPrice || 0),
            currency: values.currency || 'USD',
            company: values.company === 'turkmen' ? 'turkmen' : defaultCompany,
            notes: values.notes || '',
          });
        }}
      />
    </div>
  );
}
