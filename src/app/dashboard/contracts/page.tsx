'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FileText, Plus, Wallet } from 'lucide-react';
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
import { RecordActions } from '@/components/shared/record-actions';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useCompanyFormOptions } from '@/lib/use-company-form';
import { emptyContract, useOpsStore } from '@/lib/ops-store';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { CompanyKey } from '@/lib/demo-data';
import { useI18n } from '@/lib/i18n/store';
import { useProductCatalog } from '@/lib/product-catalog';
import { MEASUREMENT_UNITS } from '@/lib/catalog-master';
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';
import { BrandDocumentHeader, CompanyLogo } from '@/components/brand/company-logo';
import { exportContractDocument, exportContractsListDocument } from '@/lib/export';
import { isContractOpenForExpenses } from '@/lib/permissions';
import { contractValue, paymentProgress } from '@/lib/contract-payments';
import { notifyAdminChange } from '@/lib/activity-store';

export default function ContractsPage() {
  const { t, tn, locale, tx } = useI18n();
  const catalog = useProductCatalog();
  const { company } = useCompanyStore();
  const { options: companyOptions, defaultCompany, showCompanyField } =
    useCompanyFormOptions();
  const items = useOpsStore((s) => s.contracts);
  const addContract = useOpsStore((s) => s.addContract);
  const updateContract = useOpsStore((s) => s.updateContract);
  const removeContract = useOpsStore((s) => s.removeContract);
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);
  const rows = items.filter((c) => matchesCompany(c.company, company));
  const activeRows = rows.filter((c) => isContractOpenForExpenses(c.status));

  useEffect(() => {
    if (searchParams.get('new') === '1') setCreateOpen(true);
  }, [searchParams]);

  const contractFields = [
    { key: 'number', label: locale === 'en' ? 'Contract no.' : 'شماره قرارداد', required: true, dir: 'ltr' as const, placeholder: '37-617' },
    { key: 'supplierName', label: locale === 'en' ? 'Counterparty' : 'شرکت طرف قرارداد', required: true },
    {
      key: 'productCode',
      label: locale === 'en' ? 'Product' : 'نوع جنس',
      type: 'select' as const,
      options: catalog.map((p) => ({ value: p.code, label: `${p.label} (${p.unit})` })),
    },
    {
      key: 'unit',
      label: locale === 'en' ? 'Unit' : 'واحد',
      type: 'select' as const,
      options: MEASUREMENT_UNITS.map((u) => ({
        value: u.fa,
        label: locale === 'en' ? u.en : u.fa,
      })),
    },
    { key: 'totalQty', label: locale === 'en' ? 'Total qty' : 'مقدار کل قرارداد', type: 'number' as const, required: true },
    { key: 'wagons', label: locale === 'en' ? 'Wagons/trucks' : 'آمد واگن/موتر', type: 'number' as const },
    { key: 'arrived', label: locale === 'en' ? 'Arrived qty' : 'آمد (مقدار)', type: 'number' as const },
    { key: 'unloaded', label: locale === 'en' ? 'Unloaded' : 'تخلیه', type: 'number' as const },
    { key: 'sold', label: locale === 'en' ? 'Sold' : 'فروش', type: 'number' as const },
    { key: 'shortage', label: locale === 'en' ? 'Shortage' : 'کسری', type: 'number' as const },
    { key: 'waste', label: locale === 'en' ? 'Waste' : 'ضایعات', type: 'number' as const },
    { key: 'transit', label: locale === 'en' ? 'Transit' : 'ترانزیت', type: 'number' as const },
    { key: 'pricePerUnit', label: locale === 'en' ? 'Unit price' : 'قیمت واحد', type: 'number' as const },
    { key: 'location', label: locale === 'en' ? 'Location' : 'محل', placeholder: 'هرات (تورغندی)' },
    {
      key: 'company',
      label: t('colCompany'),
      type: 'select' as const,
      options: companyOptions,
    },
    { key: 'notes', label: t('colNotes') },
  ].filter((f) => f.key !== 'company' || showCompanyField);

  return (
    <div className="space-y-6 animate-fade-in">
      <FlowLinks
        steps={PURCHASE_FLOW_STEPS.map((s) => ({
          ...s,
          active: s.href === '/dashboard/contracts',
        }))}
      />

      <BrandDocumentHeader
        company={company}
        title={t('pageContracts')}
        subtitle={tn('contractsDesc')}
      />

      <PageHeader
        title={t('pageContracts')}
        description={tn('contractsDesc')}
        actions={
          <>
            <ExportButtons
              filename="contracts"
              title={t('pageContracts')}
              company={company}
              columns={[
                { key: 'number', label: locale === 'en' ? 'Contract' : 'شماره قرارداد' },
                { key: 'supplierName', label: locale === 'en' ? 'Counterparty' : 'شرکت طرف' },
                { key: 'product', label: locale === 'en' ? 'Product' : 'نوع جنس' },
                { key: 'totalQty', label: locale === 'en' ? 'Total qty' : 'مقدار کل' },
                { key: 'paidPct', label: locale === 'en' ? 'Paid %' : 'پرداخت٪' },
                { key: 'paidAmount', label: locale === 'en' ? 'Paid' : 'پرداخت‌شده' },
              ]}
              rows={rows.map((c) => {
                const progress = paymentProgress(
                  contractValue(c.totalQty, c.pricePerUnit),
                  c.paidAmount || 0
                );
                return {
                  ...c,
                  paidPct: `${progress.percent}%`,
                  paidAmount: progress.paidAmount,
                };
              })}
              onPdf={() =>
                exportContractsListDocument(
                  rows.map((c) => {
                    const progress = paymentProgress(
                      contractValue(c.totalQty, c.pricePerUnit),
                      c.paidAmount || 0
                    );
                    return {
                      number: c.number,
                      supplierName: c.supplierName,
                      product: c.product,
                      totalQty: c.totalQty,
                      arrived: c.arrived,
                      unloaded: c.unloaded,
                      sold: c.sold,
                      sellable: c.sellable,
                      transit: c.transit,
                      location: c.location,
                      status: c.status,
                      paidAmount: progress.paidAmount,
                      paidPercent: progress.percent,
                      contractValue: progress.contractVal,
                    };
                  }),
                  { company, title: t('pageContracts') }
                )
              }
            />
            <CompanySwitcher />
            <Link href="/dashboard/parties">
              <Button variant="outline">{t('pageParties')}</Button>
            </Link>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {locale === 'en' ? 'New contract' : 'قرارداد جدید'}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">تعداد قرارداد فعال</p>
            <p className="mt-1 text-2xl font-bold num">{activeRows.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">مجموع مقدار قرارداد</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatNumber(rows.reduce((s, c) => s + c.totalQty, 0), 0)} تن
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">در ترانزیت</p>
            <p className="mt-1 text-2xl font-bold num">
              {formatNumber(rows.reduce((s, c) => s + c.transit, 0), 0)} تن
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-2xl border border-teal-200 bg-teal-50/60 px-4 py-3 text-sm leading-relaxed text-teal-900">
        <p className="font-bold">
          {tx('ثبت پرداخت قرارداد از کجا؟', 'Where to record contract payment?')}
        </p>
        <p className="mt-1 text-teal-800">
          {tx(
            'روی شماره قرارداد کلیک کنید → در صفحه جزئیات بخش «پرداخت قرارداد» → دکمه «ثبت پرداخت». یا از ستون عملیات دکمه پرداخت را بزنید.',
            'Click contract number → on detail page open «Contract payments» → «Record payment». Or use the payment button in the actions column.'
          )}
        </p>
      </div>

      <Card className="rounded-2xl border-slate-200 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
          <CardTitle className="text-base">جدول قراردادها</CardTitle>
          <CompanyLogo company={company === 'arya' ? 'arya' : 'turkmen'} size="sm" />
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره قرارداد</TableHead>
                <TableHead>شرکت طرف قرارداد</TableHead>
                <TableHead>نوع جنس</TableHead>
                <TableHead>مقدار کل قرارداد</TableHead>
                <TableHead>آمد واگن/موتر</TableHead>
                <TableHead>تخلیه</TableHead>
                <TableHead>فروش</TableHead>
                <TableHead>کسری</TableHead>
                <TableHead>ضایعات</TableHead>
                <TableHead>قابل فروش</TableHead>
                <TableHead>ترانزیت</TableHead>
                <TableHead>پرداخت‌شده</TableHead>
                <TableHead>پرداخت٪</TableHead>
                <TableHead>محل</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>شرکت</TableHead>
                <TableHead className="text-end">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableEmpty colSpan={17} message="هنوز قراردادی ثبت نشده است" />
              ) : null}
              {rows.map((c) => {
                const progress = paymentProgress(
                  contractValue(c.totalQty, c.pricePerUnit),
                  c.paidAmount || 0
                );
                return (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold num">
                    <Link
                      href={`/dashboard/contracts/${c.id}`}
                      className="text-[var(--brand)] hover:underline"
                    >
                      {c.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/suppliers/${c.supplierId}`}
                      className="hover:underline text-[var(--brand)]"
                    >
                      {c.supplierName}
                    </Link>
                  </TableCell>
                  <TableCell>{c.product}</TableCell>
                  <TableCell className="num">{formatNumber(c.totalQty, 0)}</TableCell>
                  <TableCell className="num">
                    {c.wagons ? `${c.wagons} / ` : ''}
                    {formatNumber(c.arrived, 0)}
                  </TableCell>
                  <TableCell className="num">{formatNumber(c.unloaded, 0)}</TableCell>
                  <TableCell className="num">{formatNumber(c.sold, 0)}</TableCell>
                  <TableCell className="num text-amber-700">
                    {formatNumber(c.shortage, 0)}
                  </TableCell>
                  <TableCell className="num text-red-600">
                    {formatNumber(c.waste, 0)}
                  </TableCell>
                  <TableCell className="num font-semibold text-emerald-700">
                    {formatNumber(c.sellable, 0)}
                  </TableCell>
                  <TableCell className="num">{formatNumber(c.transit, 0)}</TableCell>
                  <TableCell className="num text-emerald-700">
                    {formatCurrency(progress.paidAmount)}
                  </TableCell>
                  <TableCell className="num font-bold">{progress.percent}%</TableCell>
                  <TableCell>{c.location}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant={isContractOpenForExpenses(c.status) ? 'outline' : 'secondary'}
                      onClick={() =>
                        updateContract(c.id, {
                          status: isContractOpenForExpenses(c.status) ? 'inactive' : 'active',
                        })
                      }
                    >
                      {isContractOpenForExpenses(c.status) ? 'فعال' : 'غیرفعال'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">
                      {c.company === 'arya' ? 'آریا' : 'ترکمن'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/contracts/${c.id}?pay=1`}>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          title={tx('ثبت پرداخت', 'Record payment')}
                          className="border-teal-200 text-teal-800"
                        >
                          <Wallet className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        title="خروجی قرارداد"
                        className="border-emerald-200 text-emerald-800"
                        onClick={() =>
                          void exportContractDocument({
                            id: c.id,
                            number: c.number,
                            supplierName: c.supplierName,
                            product: c.product,
                            location: c.location,
                            company: c.company,
                            status: c.status,
                            totalQty: c.totalQty,
                            pricePerUnit: c.pricePerUnit,
                            arrived: c.arrived,
                            unloaded: c.unloaded,
                            sold: c.sold,
                            shortage: c.shortage,
                            waste: c.waste,
                            sellable: c.sellable,
                            transit: c.transit,
                            paidAmount: progress.paidAmount,
                            contractValue: progress.contractVal,
                            parties: [],
                          })
                        }
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                      <RecordActions
                      title="قرارداد"
                      detailHref={`/dashboard/contracts/${c.id}`}
                      row={{
                        number: c.number,
                        supplierName: c.supplierName,
                        product: c.product,
                        totalQty: c.totalQty,
                        location: c.location,
                        sellable: c.sellable,
                      }}
                      fields={[
                        { key: 'number', label: 'شماره' },
                        { key: 'supplierName', label: 'تأمین‌کننده' },
                        { key: 'product', label: 'کالا' },
                        { key: 'totalQty', label: 'مقدار کل' },
                        { key: 'location', label: 'محل' },
                        { key: 'sellable', label: 'قابل فروش' },
                      ]}
                      onSave={(next) => {
                        updateContract(c.id, {
                          number: String(next.number ?? c.number),
                          supplierName: String(next.supplierName ?? c.supplierName),
                          product: String(next.product ?? c.product),
                          totalQty: Number(next.totalQty ?? c.totalQty),
                          location: String(next.location ?? c.location),
                          sellable: Number(next.sellable ?? c.sellable),
                        });
                      }}
                      onDelete={() => {
                        removeContract(c.id);
                        notifyAdminChange({
                          action: 'delete',
                          module: 'contracts',
                          moduleFa: 'قراردادها',
                          moduleEn: 'Contracts',
                          entityLabelFa: 'قرارداد',
                          entityLabelEn: 'contract',
                          entityName: c.number,
                        });
                      }}
                    />
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
                <p className="py-10 text-center text-sm text-slate-500">هنوز قراردادی ثبت نشده است</p>
              ) : (
                rows.map((c) => {
                  const progress = paymentProgress(
                    contractValue(c.totalQty, c.pricePerUnit),
                    c.paidAmount || 0
                  );
                  return (
                  <MobileRecordCard
                    key={c.id}
                    title={c.supplierName}
                    subtitle={`قرارداد ${c.number} · ${c.product}`}
                    badge={
                      <Badge variant={isContractOpenForExpenses(c.status) ? 'info' : 'warning'}>
                        {isContractOpenForExpenses(c.status) ? 'فعال' : 'غیرفعال'} ·{' '}
                        {c.company === 'arya' ? 'آریا' : 'ترکمن'}
                      </Badge>
                    }
                    metrics={[
                      { label: 'مقدار کل', value: formatNumber(c.totalQty, 0) },
                      { label: 'پرداخت‌شده', value: formatCurrency(progress.paidAmount) },
                      { label: 'پرداخت٪', value: `${progress.percent}%` },
                      { label: 'قابل فروش', value: formatNumber(c.sellable, 0) },
                    ]}
                    extra={
                      <>
                        <ExtraRow label="آمد" value={formatNumber(c.arrived, 0)} />
                        <ExtraRow label="تخلیه" value={formatNumber(c.unloaded, 0)} />
                        <ExtraRow label="فروش" value={formatNumber(c.sold, 0)} />
                        <ExtraRow label="کسری" value={formatNumber(c.shortage, 0)} />
                        <ExtraRow label="ضایعات" value={formatNumber(c.waste, 0)} />
                      </>
                    }
                    footer={
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/dashboard/contracts/${c.id}?pay=1`}>
                          <Button size="sm" variant="outline" className="border-teal-200 text-teal-800">
                            <Wallet className="ml-2 h-4 w-4" />
                            {tx('ثبت پرداخت', 'Payment')}
                          </Button>
                        </Link>
                        <RecordActions
                        layout="buttons"
                        title="قرارداد"
                        detailHref={`/dashboard/contracts/${c.id}`}
                        row={{
                          number: c.number,
                          supplierName: c.supplierName,
                          product: c.product,
                          totalQty: c.totalQty,
                          location: c.location,
                          sellable: c.sellable,
                        }}
                        fields={[
                          { key: 'number', label: 'شماره' },
                          { key: 'supplierName', label: 'تأمین‌کننده' },
                          { key: 'product', label: 'کالا' },
                          { key: 'totalQty', label: 'مقدار کل' },
                          { key: 'location', label: 'محل' },
                          { key: 'sellable', label: 'قابل فروش' },
                        ]}
                        onSave={(next) => {
                          updateContract(c.id, {
                            number: String(next.number ?? c.number),
                            supplierName: String(next.supplierName ?? c.supplierName),
                            product: String(next.product ?? c.product),
                            totalQty: Number(next.totalQty ?? c.totalQty),
                            location: String(next.location ?? c.location),
                            sellable: Number(next.sellable ?? c.sellable),
                          });
                        }}
                        onDelete={() => removeContract(c.id)}
                      />
                      </div>
                    }
                  />
                  );
                })
              )
            }
          />
        </CardContent>
      </Card>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={locale === 'en' ? 'New contract' : 'قرارداد جدید'}
        description={
          locale === 'en'
            ? 'Full contract form — all summary columns can be entered here.'
            : 'فرم کامل قرارداد — همه ستون‌های جدول قابل ثبت هستند. قابل فروش خودکار محاسبه می‌شود.'
        }
        size="xl"
        fields={contractFields}
        submitLabel={locale === 'en' ? 'Save contract' : 'ثبت قرارداد'}
        onSubmit={(v) => {
          const product = catalog.find((p) => p.code === v.productCode);
          const arrived = Number(v.arrived || 0);
          const unloaded = Number(v.unloaded || 0);
          const sold = Number(v.sold || 0);
          const shortage = Number(v.shortage || 0);
          const waste = Number(v.waste || 0);
          const base = unloaded || arrived || Number(v.totalQty || 0);
          const sellable = Math.max(0, base - sold - shortage - waste);
          addContract({
            ...emptyContract((v.company as CompanyKey) || defaultCompany),
            number: v.number.trim(),
            supplierName: v.supplierName.trim(),
            product: product?.label || v.productCode,
            productCode: v.productCode,
            unit: v.unit || product?.unit || 'تن',
            totalQty: Number(v.totalQty || 0),
            wagons: Number(v.wagons || 0),
            arrived,
            unloaded,
            sold,
            shortage,
            waste,
            sellable,
            transit: Number(v.transit || 0),
            pricePerUnit: Number(v.pricePerUnit || 0),
            location: v.location.trim(),
            company: (v.company as CompanyKey) || defaultCompany,
            notes: v.notes || '',
          });
        }}
      />
    </div>
  );
}
