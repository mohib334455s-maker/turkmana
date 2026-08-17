'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
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
import type { PurchaseInvoice, PurchaseStatus } from '@/lib/purchase-flow';
import { formatCurrency } from '@/lib/utils';
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';

export default function PurchaseInvoicesPage() {
  const { t } = useI18n();
  const companyName = useCompanyName();
  const { company } = useCompanyStore();
  const invoices = useOpsStore((s) => s.purchaseInvoices);
  const updateInvoice = useOpsStore((s) => s.updatePurchaseInvoice);
  const [editing, setEditing] = useState<PurchaseInvoice | null>(null);

  const rows = useMemo(
    () => invoices.filter((i) => matchesCompany(i.company, company)),
    [invoices, company]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <FlowLinks
        steps={PURCHASE_FLOW_STEPS.map((s) => ({
          ...s,
          active: s.href === '/dashboard/purchases/invoices',
        }))}
      />

      <PageHeader
        title={t('invTitle')}
        description={t('invDesc')}
        actions={
          <>
            <ExportButtons
              filename="purchase-invoices"
              title={t('invTitle')}
              columns={[
                { key: 'code', label: t('colInvoice') },
                { key: 'poCode', label: t('colLinkedOrder') },
                { key: 'date', label: t('colDate') },
                { key: 'dueDate', label: t('colDueDate') },
                { key: 'supplier', label: t('colSupplier') },
                { key: 'amount', label: t('colAmount') },
                { key: 'paid', label: t('colPaid') },
                { key: 'balance', label: t('colBalance') },
                { key: 'company', label: t('colCompany') },
                { key: 'status', label: t('colStatus') },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
          </>
        }
      />

      <p className="text-sm text-slate-500">{t('invoicesAutoCreated')}</p>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t('invTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('colSupplier')}</TableHead>
                      <TableHead>{t('colInvoice')}</TableHead>
                      <TableHead>{t('colLinkedOrder')}</TableHead>
                      <TableHead>{t('colDate')}</TableHead>
                      <TableHead>{t('colDueDate')}</TableHead>
                      <TableHead>{t('colAmount')}</TableHead>
                      <TableHead>{t('colPaid')}</TableHead>
                      <TableHead>{t('colBalance')}</TableHead>
                      <TableHead>{t('colCompany')}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                      <TableHead className="text-center">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty colSpan={11} message={t('noPurchaseInvoices')} />
                    ) : null}
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <Link href={`/dashboard/suppliers/${r.supplierId}`} className="hover:text-teal-700">
                            {r.supplier}
                          </Link>
                        </TableCell>
                        <TableCell className="num font-semibold">
                          {r.code || t('invoicePendingNo')}
                        </TableCell>
                        <TableCell>
                          <Link href="/dashboard/purchases" className="num text-[var(--brand)] hover:underline">
                            {r.poCode}
                          </Link>
                        </TableCell>
                        <TableCell className="num">{r.date}</TableCell>
                        <TableCell className="num">{r.dueDate || '—'}</TableCell>
                        <TableCell className="num font-semibold">
                          {formatCurrency(r.amount, r.currency)}
                        </TableCell>
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
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-1">
                            {r.status !== 'cancelled' ? (
                              <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                                {t('editInvoice')}
                              </Button>
                            ) : null}
                            {r.status === 'pending' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateInvoice(r.id, { status: 'approved' })}
                              >
                                {t('approve')}
                              </Button>
                            ) : null}
                            {r.status === 'approved' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateInvoice(r.id, { status: 'completed' })}
                              >
                                {t('complete')}
                              </Button>
                            ) : null}
                            {r.status !== 'cancelled' && r.status !== 'completed' ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateInvoice(r.id, { status: 'cancelled' })}
                              >
                                {t('cancelRecord')}
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">{t('noPurchaseInvoices')}</p>
              ) : (
                rows.map((r) => (
                  <MobileRecordCard
                    key={r.id}
                    title={r.code || r.poCode}
                    subtitle={`${r.supplier} · ${r.date}`}
                    badge={<PurchaseStatusBadge status={r.status} />}
                    metrics={[
                      { label: t('colAmount'), value: formatCurrency(r.amount, r.currency) },
                      { label: t('colPaid'), value: formatCurrency(r.paid, r.currency) },
                      { label: t('colBalance'), value: formatCurrency(r.balance, r.currency) },
                      { label: t('colDueDate'), value: r.dueDate || '—' },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={t('colLinkedOrder')} value={r.poCode} />
                        <ExtraRow label={t('colInvoice')} value={r.code || t('invoicePendingNo')} />
                      </>
                    }
                    footer={
                      r.status !== 'cancelled' ? (
                        <Button size="sm" variant="outline" onClick={() => setEditing(r)}>
                          {t('editInvoice')}
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
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={t('editInvoice')}
        fields={[
          { key: 'code', label: t('officialInvoiceNo') },
          { key: 'date', label: t('colDate'), type: 'date' },
          { key: 'dueDate', label: t('colDueDate'), type: 'date' },
          { key: 'paid', label: t('colPaid'), type: 'number' },
          {
            key: 'status',
            label: t('colStatus'),
            type: 'select',
            options: [
              { value: 'pending', label: t('statusPending') },
              { value: 'approved', label: t('statusApproved') },
              { value: 'completed', label: t('statusCompleted') },
              { value: 'cancelled', label: t('statusCancelled') },
            ],
          },
          { key: 'notes', label: t('colNotes') },
        ]}
        initial={
          editing
            ? {
                code: editing.code,
                date: editing.date,
                dueDate: editing.dueDate,
                paid: String(editing.paid),
                status: editing.status,
                notes: editing.notes,
              }
            : undefined
        }
        submitLabel={t('save')}
        onSubmit={(values) => {
          if (!editing) return;
          updateInvoice(editing.id, {
            code: values.code || '',
            date: values.date || editing.date,
            dueDate: values.dueDate || '',
            paid: Number(values.paid || 0),
            notes: values.notes || '',
            status: (values.status as PurchaseStatus) || editing.status,
          });
        }}
      />
    </div>
  );
}
