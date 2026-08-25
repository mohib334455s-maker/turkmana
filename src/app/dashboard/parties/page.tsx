'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { RecordActions } from '@/components/shared/record-actions';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';
import { useCompanyFormOptions } from '@/lib/use-company-form';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import { normalizeParty } from '@/lib/stock-lots';
import { isPartyOpenForExpenses } from '@/lib/permissions';
import { useProductCatalog } from '@/lib/product-catalog';
import { MEASUREMENT_UNITS } from '@/lib/catalog-master';
import { formatNumber } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';
import type { CompanyKey } from '@/lib/demo-data';

const EMPTY: OpsRow[] = [];

export default function PartiesPage() {
  const { t, locale } = useI18n();
  const { options: companyOptions, defaultCompany, showCompanyField } =
    useCompanyFormOptions();
  const catalog = useProductCatalog();
  const contracts = useOpsStore((s) => s.contracts);
  const rawRows = useOpsStore((s) => (s.lists.parties ?? EMPTY) as OpsRow[]);
  const addToList = useOpsStore((s) => s.addToList);
  const setList = useOpsStore((s) => s.setList);
  const setPartyStatus = useOpsStore((s) => s.setPartyStatus);
  const [createOpen, setCreateOpen] = useState(false);

  const rows = useMemo(
    () => rawRows.map((r) => normalizeParty(r as unknown as Record<string, unknown>)),
    [rawRows]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <FlowLinks
        steps={PURCHASE_FLOW_STEPS.map((s) => ({
          ...s,
          active: s.href === '/dashboard/parties',
        }))}
      />

      <PageHeader
        title={t('pageParties')}
        description={
          locale === 'en'
            ? 'Shipment parties under contracts — arrival, unload, sales, shortage, waste, sellable, transit.'
            : 'پارتی‌های زیر قرارداد — آمد، تخلیه، فروش، کسرات، ضایعات، قابل فروش، ترانزیت (مثل جدول اکسل).'
        }
        actions={
          <>
            <ExportButtons
              filename="parties"
              title={t('pageParties')}
              columns={[
                { key: 'number', label: locale === 'en' ? 'Party' : 'شماره پارتی' },
                { key: 'contractNumber', label: locale === 'en' ? 'Contract' : 'قرارداد' },
                { key: 'supplierName', label: locale === 'en' ? 'Vendor' : 'تأمین‌کننده' },
                { key: 'product', label: locale === 'en' ? 'Product' : 'کالا' },
                { key: 'location', label: locale === 'en' ? 'Location' : 'محل' },
                { key: 'plannedQty', label: locale === 'en' ? 'Planned' : 'مقدار' },
                { key: 'arrivedQty', label: locale === 'en' ? 'Arrived' : 'آمد' },
                { key: 'unloadedQty', label: locale === 'en' ? 'Unloaded' : 'تخلیه' },
                { key: 'soldQty', label: locale === 'en' ? 'Sold' : 'فروش' },
                { key: 'sellableQty', label: locale === 'en' ? 'Sellable' : 'قابل فروش' },
              ]}
              rows={rows.map((p) => ({
                number: p.number,
                contractNumber: p.contractNumber,
                supplierName: p.supplierName,
                product: p.product,
                location: p.location,
                plannedQty: p.plannedQty,
                arrivedQty: p.arrived.qty,
                unloadedQty: p.unloaded.qty,
                soldQty: p.sold.qty,
                sellableQty: p.sellable.qty,
              }))}
            />
            <Link href="/dashboard/contracts">
              <Button variant="outline">{t('pageContracts')}</Button>
            </Link>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {locale === 'en' ? 'New party' : 'پارتی جدید'}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {locale === 'en' ? 'Party list' : 'لیست پارتی‌ها'}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{locale === 'en' ? 'Party' : 'شماره پارتی'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Contract' : 'قرارداد'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Vendor' : 'تأمین‌کننده'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Product' : 'کالا'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Location' : 'محل'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Wagons' : 'واگن/موتر'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Qty' : 'مقدار'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Arrived' : 'آمد'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Unloaded' : 'تخلیه'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Sold' : 'فروش'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Sellable' : 'قابل فروش'}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                      <TableHead className="text-center">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.length === 0 ? (
                      <TableEmpty
                        colSpan={13}
                        message={locale === 'en' ? 'No parties yet' : 'هنوز پارتی ثبت نشده است'}
                      />
                    ) : null}
                    {rows.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <Link
                            href={`/dashboard/parties/${p.id}`}
                            className="font-semibold num text-teal-700 hover:underline"
                          >
                            {p.number}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/contracts/${p.contractId}`}
                            className="num text-[var(--brand)] hover:underline"
                          >
                            {p.contractNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{p.supplierName || '—'}</TableCell>
                        <TableCell>{p.product || '—'}</TableCell>
                        <TableCell>{p.location}</TableCell>
                        <TableCell className="num">{p.plannedWagons}</TableCell>
                        <TableCell className="num">
                          {formatNumber(p.plannedQty, 0)} {p.unit}
                        </TableCell>
                        <TableCell className="num">{formatNumber(p.arrived.qty, 0)}</TableCell>
                        <TableCell className="num">{formatNumber(p.unloaded.qty, 0)}</TableCell>
                        <TableCell className="num">{formatNumber(p.sold.qty, 0)}</TableCell>
                        <TableCell className="num font-semibold text-emerald-700">
                          {formatNumber(p.sellable.qty, 0)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            <Badge variant={isPartyOpenForExpenses(p.status) ? 'success' : 'warning'}>
                              {isPartyOpenForExpenses(p.status)
                                ? locale === 'en'
                                  ? 'Active'
                                  : 'فعال'
                                : locale === 'en'
                                  ? 'Inactive'
                                  : 'غیرفعال'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setPartyStatus(
                                  p.id,
                                  isPartyOpenForExpenses(p.status) ? 'inactive' : 'active'
                                )
                              }
                            >
                              {isPartyOpenForExpenses(p.status)
                                ? locale === 'en'
                                  ? 'Close'
                                  : 'بستن'
                                : locale === 'en'
                                  ? 'Open'
                                  : 'باز کردن'}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RecordActions
                            title={locale === 'en' ? 'Party' : 'پارتی'}
                            detailHref={`/dashboard/parties/${p.id}`}
                            row={{
                              number: p.number,
                              contractNumber: p.contractNumber,
                              location: p.location,
                              plannedQty: p.plannedQty,
                              status: p.status,
                            }}
                            fields={[
                              { key: 'number', label: locale === 'en' ? 'Party no.' : 'شماره پارتی' },
                              { key: 'location', label: locale === 'en' ? 'Location' : 'محل' },
                              { key: 'plannedQty', label: locale === 'en' ? 'Qty' : 'مقدار' },
                              { key: 'status', label: t('colStatus') },
                            ]}
                            onSave={(next) => {
                              setList(
                                'parties',
                                rawRows.map((r) =>
                                  Number(r.id) === p.id
                                    ? {
                                        ...r,
                                        number: String(next.number ?? p.number),
                                        location: String(next.location ?? p.location),
                                        qty: Number(next.plannedQty ?? p.plannedQty),
                                        plannedQty: Number(next.plannedQty ?? p.plannedQty),
                                        status: String(next.status ?? p.status),
                                      }
                                    : r
                                )
                              );
                            }}
                            onDelete={() =>
                              setList(
                                'parties',
                                rawRows.filter((r) => Number(r.id) !== p.id)
                              )
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {locale === 'en' ? 'No parties yet' : 'هنوز پارتی ثبت نشده است'}
                </p>
              ) : (
                rows.map((p) => (
                  <MobileRecordCard
                    key={p.id}
                    title={p.number}
                    subtitle={`${p.contractNumber} · ${p.location}`}
                    badge={<Badge variant="muted">{p.status}</Badge>}
                    metrics={[
                      { label: locale === 'en' ? 'Qty' : 'مقدار', value: formatNumber(p.plannedQty, 0) },
                      {
                        label: locale === 'en' ? 'Sellable' : 'قابل فروش',
                        value: formatNumber(p.sellable.qty, 0),
                      },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={locale === 'en' ? 'Product' : 'کالا'} value={p.product} />
                        <ExtraRow
                          label={locale === 'en' ? 'Unloaded' : 'تخلیه'}
                          value={formatNumber(p.unloaded.qty, 0)}
                        />
                      </>
                    }
                    footer={
                      <Link href={`/dashboard/parties/${p.id}`}>
                        <Button size="sm" variant="outline">
                          {t('details')}
                        </Button>
                      </Link>
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </Card>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={locale === 'en' ? 'New party' : 'پارتی جدید'}
        description={
          locale === 'en'
            ? 'Linked to a contract. Open party details to enter arrival/unload/sales like the spreadsheet.'
            : 'به قرارداد وصل می‌شود. در جزئیات پارتی ارقام آمد/تخلیه/فروش مثل جدول اکسل ثبت می‌شود.'
        }
        size="xl"
        fields={[
          {
            key: 'contractId',
            label: locale === 'en' ? 'Contract' : 'قرارداد',
            type: 'select',
            required: true,
            options: contracts.map((c) => ({
              value: String(c.id),
              label: `${c.number} — ${c.supplierName} — ${c.product}`,
            })),
          },
          {
            key: 'number',
            label: locale === 'en' ? 'Party no.' : 'شماره پارتی',
            required: true,
            dir: 'ltr',
            placeholder: '96',
          },
          {
            key: 'productCode',
            label: locale === 'en' ? 'Product' : 'کالا',
            type: 'select',
            options: catalog.map((p) => ({ value: p.code, label: `${p.label} (${p.unit})` })),
          },
          {
            key: 'unit',
            label: locale === 'en' ? 'Unit' : 'واحد',
            type: 'select',
            options: MEASUREMENT_UNITS.map((u) => ({
              value: u.fa,
              label: locale === 'en' ? u.en : u.fa,
            })),
          },
          { key: 'plannedQty', label: locale === 'en' ? 'Planned qty' : 'مقدار برنامه', type: 'number', required: true },
          { key: 'plannedWagons', label: locale === 'en' ? 'Wagons/trucks' : 'واگن/موتر', type: 'number' },
          { key: 'location', label: locale === 'en' ? 'Location' : 'محل', placeholder: 'هرات (تورغندی)' },
          ...(showCompanyField
            ? [
                {
                  key: 'company',
                  label: t('colCompany'),
                  type: 'select' as const,
                  options: companyOptions,
                },
              ]
            : []),
          { key: 'notes', label: t('colNotes') },
        ]}
        submitLabel={t('save')}
        onSubmit={(v) => {
          const contract = contracts.find((c) => String(c.id) === v.contractId);
          const product = catalog.find((p) => p.code === v.productCode);
          const qty = Number(v.plannedQty || 0);
          const wagons = Number(v.plannedWagons || 0);
          addToList('parties', {
            number: v.number.trim(),
            contractId: contract?.id ?? 0,
            contractNumber: contract?.number ?? '',
            supplierName: contract?.supplierName ?? '',
            product: product?.label || contract?.product || '',
            productCode: product?.code || contract?.productCode || '',
            unit: v.unit || product?.unit || contract?.unit || 'تن',
            location: v.location,
            company: (v.company as CompanyKey) || contract?.company || defaultCompany,
            plannedWagons: wagons,
            plannedQty: qty,
            wagons,
            qty,
            arrived: 0,
            unloaded: 0,
            sold: 0,
            shortage: 0,
            waste: 0,
            sellable: 0,
            transit: 0,
            arrivedWagons: 0,
            unloadedWagons: 0,
            soldWagons: 0,
            status: locale === 'en' ? 'Open' : 'ثبت‌شده',
            notes: v.notes || '',
          });
        }}
      />
    </div>
  );
}
