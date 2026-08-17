'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useI18n } from '@/lib/i18n/store';
import { useOpsStore } from '@/lib/ops-store';
import { todayIso } from '@/lib/purchase-flow';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';

function CompanyPurchasesInner() {
  const { t } = useI18n();
  const companyName = useCompanyName();
  const { company } = useCompanyStore();
  const searchParams = useSearchParams();
  const orders = useOpsStore((s) => s.purchaseOrders);
  const rowsAll = useOpsStore((s) => s.companyPurchases);
  const createFromOrder = useOpsStore((s) => s.createCompanyPurchaseFromOrder);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => rowsAll.filter((p) => matchesCompany(p.company, company)),
    [rowsAll, company]
  );

  const eligible = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status !== 'cancelled' &&
          o.status !== 'completed' &&
          matchesCompany(o.company, company) &&
          !rowsAll.some((p) => p.purchaseOrderId === o.id && p.status !== 'cancelled')
      ),
    [orders, rowsAll, company]
  );

  const fromOrder = searchParams.get('fromOrder');
  useEffect(() => {
    if (fromOrder && eligible.some((o) => String(o.id) === fromOrder)) setOpen(true);
  }, [fromOrder, eligible]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          amount: acc.amount + r.amount,
          paid: acc.paid + r.paid,
          balance: acc.balance + r.balance,
        }),
        { amount: 0, paid: 0, balance: 0 }
      ),
    [rows]
  );

  const selected = eligible.find((o) => String(o.id) === fromOrder) ?? eligible[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <FlowLinks
        steps={PURCHASE_FLOW_STEPS.map((s) => ({
          ...s,
          active: s.href === '/dashboard/purchases/company',
        }))}
      />

      <PageHeader
        title={t('cpTitle')}
        description={t('cpDesc')}
        actions={
          <>
            <ExportButtons
              filename="company-purchases"
              title={t('cpTitle')}
              columns={[
                { key: 'number', label: t('colOrderNo') },
                { key: 'poCode', label: t('colLinkedOrder') },
                { key: 'date', label: t('colDate') },
                { key: 'seller', label: t('colSupplier') },
                { key: 'product', label: t('colProduct') },
                { key: 'qty', label: t('colQty') },
                { key: 'rate', label: t('colRate') },
                { key: 'amount', label: t('colAmount') },
                { key: 'paid', label: t('colPaid') },
                { key: 'balance', label: t('colBalance') },
                { key: 'status', label: t('colStatus') },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Button onClick={() => setOpen(true)} disabled={eligible.length === 0}>
              <Plus className="ms-2 h-4 w-4" />
              {t('createFromOrder')}
            </Button>
          </>
        }
      />

      {eligible.length === 0 ? (
        <p className="text-sm text-slate-500">
          {t('noEligibleOrders')}{' '}
          <Link href="/dashboard/purchases" className="text-[var(--brand)] underline">
            {t('poTitle')}
          </Link>
        </p>
      ) : null}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('cpTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('colOrderNo')}</TableHead>
                      <TableHead>{t('colLinkedOrder')}</TableHead>
                      <TableHead>{t('colDate')}</TableHead>
                      <TableHead>{t('colSupplier')}</TableHead>
                      <TableHead>{t('colProduct')}</TableHead>
                      <TableHead>{t('colLocation')}</TableHead>
                      <TableHead>{t('colQty')}</TableHead>
                      <TableHead>{t('colRate')}</TableHead>
                      <TableHead>{t('colAmount')}</TableHead>
                      <TableHead>{t('colFreight')}</TableHead>
                      <TableHead>{t('colOtherCosts')}</TableHead>
                      <TableHead>{t('colPaid')}</TableHead>
                      <TableHead>{t('colBalance')}</TableHead>
                      <TableHead>{t('colCompany')}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty colSpan={15} message={t('noCompanyPurchases')} />
                    ) : null}
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-semibold num">{r.number}</TableCell>
                        <TableCell>
                          <Link href="/dashboard/purchases" className="num text-[var(--brand)] hover:underline">
                            {r.poCode}
                          </Link>
                        </TableCell>
                        <TableCell className="num">{r.date}</TableCell>
                        <TableCell>
                          <Link href={`/dashboard/suppliers/${r.supplierId}`} className="hover:text-teal-700">
                            {r.seller}
                          </Link>
                        </TableCell>
                        <TableCell>{r.product}</TableCell>
                        <TableCell>{r.location || '—'}</TableCell>
                        <TableCell className="num">
                          {formatNumber(r.qty, 0)} {r.unit}
                        </TableCell>
                        <TableCell className="num">{formatCurrency(r.rate, r.currency)}</TableCell>
                        <TableCell className="num font-semibold">
                          {formatCurrency(r.amount, r.currency)}
                        </TableCell>
                        <TableCell className="num">{formatCurrency(r.freight, r.currency)}</TableCell>
                        <TableCell className="num">{formatCurrency(r.otherCosts, r.currency)}</TableCell>
                        <TableCell className="num text-emerald-700">
                          {formatCurrency(r.paid, r.currency)}
                        </TableCell>
                        <TableCell className="num text-amber-700 font-semibold">
                          {formatCurrency(r.balance, r.currency)}
                        </TableCell>
                        <TableCell>{companyName(r.company)}</TableCell>
                        <TableCell>
                          <PurchaseStatusBadge status={r.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.length > 0 ? (
                      <TableRow className="bg-slate-50 font-semibold">
                        <TableCell colSpan={8}>{t('colAmount')}</TableCell>
                        <TableCell className="num">{formatCurrency(totals.amount)}</TableCell>
                        <TableCell colSpan={2} />
                        <TableCell className="num text-emerald-700">
                          {formatCurrency(totals.paid)}
                        </TableCell>
                        <TableCell className="num text-amber-700">
                          {formatCurrency(totals.balance)}
                        </TableCell>
                        <TableCell colSpan={2} />
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">{t('noCompanyPurchases')}</p>
              ) : (
                rows.map((r) => (
                  <MobileRecordCard
                    key={r.id}
                    title={r.number}
                    subtitle={`${r.seller} · ${r.date}`}
                    badge={<PurchaseStatusBadge status={r.status} />}
                    metrics={[
                      { label: t('colAmount'), value: formatCurrency(r.amount, r.currency) },
                      { label: t('colPaid'), value: formatCurrency(r.paid, r.currency) },
                      { label: t('colBalance'), value: formatCurrency(r.balance, r.currency) },
                      { label: t('colQty'), value: `${formatNumber(r.qty, 0)} ${r.unit}` },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={t('colLinkedOrder')} value={r.poCode} />
                        <ExtraRow label={t('colProduct')} value={r.product} />
                        <ExtraRow label={t('colLocation')} value={r.location || '—'} />
                      </>
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
        title={t('receiveGoods')}
        description={t('cpDesc')}
        fields={[
          {
            key: 'purchaseOrderId',
            label: t('colLinkedOrder'),
            type: 'select',
            required: true,
            options: eligible.map((o) => ({
              value: String(o.id),
              label: `${o.code} — ${o.supplier} — ${o.product}`,
            })),
          },
          { key: 'date', label: t('colDate'), type: 'date', required: true },
          { key: 'qty', label: t('receivedQty'), type: 'number', required: true },
          { key: 'location', label: t('colLocation') },
          { key: 'contract', label: t('colContract') },
          { key: 'freight', label: t('colFreight'), type: 'number' },
          { key: 'otherCosts', label: t('colOtherCosts'), type: 'number' },
          { key: 'paid', label: t('colPaid'), type: 'number' },
          { key: 'notes', label: t('colNotes') },
        ]}
        initial={{
          purchaseOrderId: selected ? String(selected.id) : '',
          date: todayIso(),
          qty: selected ? String(selected.qty) : '',
          freight: '0',
          otherCosts: '0',
          paid: '0',
        }}
        submitLabel={t('save')}
        onSubmit={(values) => {
          createFromOrder({
            purchaseOrderId: Number(values.purchaseOrderId),
            date: values.date || todayIso(),
            qty: Number(values.qty || 0),
            freight: Number(values.freight || 0),
            otherCosts: Number(values.otherCosts || 0),
            paid: Number(values.paid || 0),
            location: values.location || '',
            contract: values.contract || '',
            notes: values.notes || '',
          });
        }}
      />
    </div>
  );
}

export default function CompanyPurchasesPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={<p className="p-8 text-sm text-slate-500">{t('loading')}</p>}>
      <CompanyPurchasesInner />
    </Suspense>
  );
}
