'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import { TableEmpty } from '@/components/shared/table-empty';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { formatNumber } from '@/lib/utils';
import type { CompanyKey } from '@/lib/demo-data';

export default function WarehousesPage() {
  const { t, locale } = useI18n();
  const { company } = useCompanyStore();
  const warehouses = useOpsStore((s) => s.warehouseEntities);
  const lots = useOpsStore((s) => s.stockLots);
  const addWarehouse = useOpsStore((s) => s.addWarehouse);
  const removeWarehouse = useOpsStore((s) => s.removeWarehouse);
  const [createOpen, setCreateOpen] = useState(false);

  const rows = useMemo(
    () => warehouses.filter((w) => matchesCompany(w.company, company)),
    [warehouses, company]
  );

  const enriched = rows.map((w) => {
    const whLots = lots.filter((l) => l.warehouseId === w.id);
    const totalQty = whLots.reduce((s, l) => s + l.qty, 0);
    const products = new Set(whLots.map((l) => l.productCode)).size;
    const contracts = new Set(whLots.map((l) => l.contractId)).size;
    return { ...w, totalQty, products, contracts, lotCount: whLots.length };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <FlowLinks
        steps={PURCHASE_FLOW_STEPS.map((s) => ({
          ...s,
          active: s.href === '/dashboard/warehouses',
        }))}
      />

      <PageHeader
        title={t('pageWarehouses')}
        description={
          locale === 'en'
            ? 'Each storage has a goods ledger (unload/load) and a cash ledger (payments and storage rent assessment).'
            : 'هر ذخیره دو حساب دارد: جنسی (تخلیه و بارگیری) و نقدی (پرداخت و سنجش کرایه ذخیره).'
        }
        actions={
          <>
            <ExportButtons
              filename="warehouses"
              title={t('pageWarehouses')}
              columns={[
                { key: 'name', label: locale === 'en' ? 'Name' : 'نام' },
                { key: 'location', label: locale === 'en' ? 'Location' : 'محل' },
                { key: 'totalQty', label: locale === 'en' ? 'Total qty' : 'جمع موجودی' },
                { key: 'contracts', label: locale === 'en' ? 'Contracts' : 'قراردادها' },
                { key: 'products', label: locale === 'en' ? 'Products' : 'کالاها' },
              ]}
              rows={enriched}
            />
            <CompanySwitcher />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {locale === 'en' ? 'New storage' : 'ذخیره جدید'}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <WarehouseIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-slate-500">
                {locale === 'en' ? 'Storage sites' : 'تعداد ذخیره'}
              </p>
              <p className="text-xl font-bold num">{enriched.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">
              {locale === 'en' ? 'Active lots' : 'لات‌های فعال'}
            </p>
            <p className="mt-1 text-xl font-bold num">
              {lots.filter((l) => matchesCompany(l.company, company)).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">
              {locale === 'en' ? 'Total stock qty' : 'جمع موجودی'}
            </p>
            <p className="mt-1 text-xl font-bold num">
              {formatNumber(
                lots
                  .filter((l) => matchesCompany(l.company, company))
                  .reduce((s, l) => s + l.qty, 0),
                0
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="bg-emerald-700 px-4 py-3 text-center text-lg font-bold text-white">
          {locale === 'en' ? 'Storage' : 'ذخایر'}
        </div>
        <CardContent className="px-0 pb-4 pt-0 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{locale === 'en' ? 'No.' : 'شماره'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Account' : 'طرف حساب'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Type' : 'نوع'}</TableHead>
                      <TableHead className="text-center">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enriched.length === 0 ? (
                      <TableEmpty
                        colSpan={4}
                        message={
                          locale === 'en'
                            ? 'No storage accounts yet — create one'
                            : 'هنوز ذخیره‌ای ثبت نشده — یکی بسازید'
                        }
                      />
                    ) : null}
                    {enriched.map((w, i) => (
                      <TableRow key={w.id}>
                        <TableCell className="num">{i + 1}</TableCell>
                        <TableCell>
                          <Link
                            href={`/dashboard/warehouses/${w.id}`}
                            className="font-semibold text-slate-900 hover:text-teal-700"
                          >
                            {w.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="muted">{w.type || (locale === 'en' ? 'Storage' : 'ذخیره')}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Link href={`/dashboard/warehouses/${w.id}`}>
                              <Button size="icon" variant="ghost" title={t('details')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeWarehouse(w.id)}
                            >
                              {t('delete')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            }
            cards={
              enriched.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {locale === 'en' ? 'No storage yet' : 'هنوز ذخیره‌ای ثبت نشده'}
                </p>
              ) : (
                enriched.map((w) => (
                  <MobileRecordCard
                    key={w.id}
                    title={w.name}
                    subtitle={w.location}
                    badge={<Badge variant="muted">{w.type || (locale === 'en' ? 'Storage' : 'ذخیره')}</Badge>}
                    metrics={[
                      { label: locale === 'en' ? 'Qty' : 'موجودی', value: formatNumber(w.totalQty, 0) },
                      { label: locale === 'en' ? 'Contracts' : 'قرارداد', value: String(w.contracts) },
                    ]}
                    extra={<ExtraRow label={t('colCompany')} value={w.company} />}
                    footer={
                      <Link href={`/dashboard/warehouses/${w.id}`}>
                        <Button size="sm" variant="outline">
                          {locale === 'en' ? 'Goods or cash' : 'جنسی یا نقدی'}
                        </Button>
                      </Link>
                    }
                  />
                ))
              )
            }
          />
        </CardContent>
      </div>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={locale === 'en' ? 'New storage' : 'ذخیره جدید'}
        size="lg"
        fields={[
          { key: 'name', label: locale === 'en' ? 'Account name' : 'طرف حساب / نام ذخیره', required: true },
          { key: 'location', label: locale === 'en' ? 'Location' : 'محل', required: true, placeholder: 'هرات / تورغندی' },
          {
            key: 'type',
            label: locale === 'en' ? 'Type' : 'نوع',
            type: 'select',
            options: [
              { value: 'مواد ارتزاقی', label: locale === 'en' ? 'Foodstuffs' : 'مواد ارتزاقی' },
              { value: 'تیل', label: locale === 'en' ? 'Oil / fuel' : 'تیل' },
              { value: 'گاز', label: locale === 'en' ? 'Gas' : 'گاز' },
              {
                value: 'کود کیمیاوی',
                label: locale === 'en' ? 'Chemical fertilizer' : 'کود کیمیاوی',
              },
              {
                value: 'مواد ساختمانی',
                label: locale === 'en' ? 'Building materials' : 'مواد ساختمانی',
              },
              { value: 'فلزات', label: locale === 'en' ? 'Metals' : 'فلزات' },
            ],
          },
          {
            key: 'company',
            label: t('colCompany'),
            type: 'select',
            options: [
              { value: 'arya', label: t('companyArya') },
              { value: 'turkmen', label: t('companyTurkmen') },
            ],
          },
          { key: 'capacity', label: locale === 'en' ? 'Capacity' : 'ظرفیت', type: 'number' },
          { key: 'notes', label: t('colNotes') },
        ]}
        submitLabel={t('save')}
        onSubmit={(v) => {
          addWarehouse({
            name: v.name.trim(),
            location: v.location.trim(),
            type: v.type || 'مواد ارتزاقی',
            company: (v.company as CompanyKey) || 'arya',
            capacity: Number(v.capacity || 0),
            notes: v.notes || '',
          });
        }}
      />
    </div>
  );
}
