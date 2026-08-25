'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Warehouse as WarehouseIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
import { ExtraRow, MobileRecordCard } from '@/components/shared/mobile-record-card';
import { FlowLinks, PURCHASE_FLOW_STEPS } from '@/components/shared/flow-links';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useCompanyFormOptions } from '@/lib/use-company-form';
import {
  portLabel,
  portSelectOptions,
  unitLabel,
  unitSelectOptions,
} from '@/lib/catalog-master';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';
import { formatNumber } from '@/lib/utils';
import type { CompanyKey } from '@/lib/demo-data';

const STORAGE_TYPES = [
  { value: 'مواد ارتزاقی', en: 'Foodstuffs' },
  { value: 'تیل', en: 'Oil / fuel' },
  { value: 'گاز', en: 'Gas' },
  { value: 'کود کیمیاوی', en: 'Chemical fertilizer' },
  { value: 'مواد ساختمانی', en: 'Building materials' },
  { value: 'فلزات', en: 'Metals' },
] as const;

export default function WarehousesPage() {
  const { t, locale, tx } = useI18n();
  const { company } = useCompanyStore();
  const { options: companyOptions, defaultCompany, showCompanyField } =
    useCompanyFormOptions();
  const warehouses = useOpsStore((s) => s.warehouseEntities);
  const lots = useOpsStore((s) => s.stockLots);
  const addWarehouse = useOpsStore((s) => s.addWarehouse);
  const removeWarehouse = useOpsStore((s) => s.removeWarehouse);
  const [createOpen, setCreateOpen] = useState(false);
  const [portFilter, setPortFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const unitOptions = useMemo(() => unitSelectOptions(locale), [locale]);
  const portOptions = useMemo(() => portSelectOptions(locale), [locale]);

  const rows = useMemo(
    () => warehouses.filter((w) => matchesCompany(w.company, company)),
    [warehouses, company]
  );

  const enriched = useMemo(
    () =>
      rows.map((w) => {
        const whLots = lots.filter((l) => l.warehouseId === w.id);
        const totalQty = whLots.reduce((s, l) => s + l.qty, 0);
        const products = new Set(whLots.map((l) => l.productCode)).size;
        const contracts = new Set(whLots.map((l) => l.contractId)).size;
        const stockUnits = [
          ...new Set(whLots.map((l) => l.unit).filter(Boolean)),
        ];
        const capacityUnit = w.capacityUnit || stockUnits[0] || 'تن';
        const port = w.port || w.location || '';
        return {
          ...w,
          port,
          capacityUnit,
          totalQty,
          products,
          contracts,
          lotCount: whLots.length,
          stockUnits,
        };
      }),
    [rows, lots]
  );

  const filtered = useMemo(() => {
    return enriched.filter((w) => {
      if (portFilter && w.port !== portFilter && w.location !== portFilter) return false;
      if (unitFilter && w.capacityUnit !== unitFilter && !w.stockUnits.includes(unitFilter))
        return false;
      if (typeFilter && w.type !== typeFilter) return false;
      return true;
    });
  }, [enriched, portFilter, unitFilter, typeFilter]);

  const formatCapacity = (qty: number, unit: string) =>
    `${formatNumber(qty, 0)} ${unitLabel(unit, locale)}`;

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
            ? 'Capacity always has a unit (ton, carton, bag…). Filter by port and unit.'
            : 'ظرفیت همیشه با واحد است (تن، کارتن، خریطه…). فیلتر بندر و واحد جداگانه.'
        }
        actions={
          <>
            <ExportButtons
              filename="warehouses"
              title={t('pageWarehouses')}
              columns={[
                { key: 'name', label: locale === 'en' ? 'Name' : 'نام' },
                { key: 'port', label: locale === 'en' ? 'Port' : 'بندر' },
                { key: 'type', label: locale === 'en' ? 'Type' : 'نوع' },
                { key: 'capacity', label: locale === 'en' ? 'Capacity' : 'ظرفیت' },
                { key: 'capacityUnit', label: locale === 'en' ? 'Unit' : 'واحد' },
                { key: 'totalQty', label: locale === 'en' ? 'Stock qty' : 'موجودی' },
              ]}
              rows={filtered.map(({ stockUnits, ...rest }) => ({
                ...rest,
                stockUnits: stockUnits.join(' · '),
              }))}
            />
            <CompanySwitcher />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {locale === 'en' ? 'New storage' : 'ذخیره جدید'}
            </Button>
          </>
        }
      />

      <Card className="rounded-2xl border-slate-200">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
          <div>
            <Label>{tx('فیلتر بندر', 'Filter by port')}</Label>
            <Select value={portFilter} onChange={(e) => setPortFilter(e.target.value)}>
              <option value="">{tx('همه بندرها', 'All ports')}</option>
              {portOptions.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{tx('فیلتر واحد', 'Filter by unit')}</Label>
            <Select value={unitFilter} onChange={(e) => setUnitFilter(e.target.value)}>
              <option value="">{tx('همه واحدها', 'All units')}</option>
              {unitOptions.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{tx('فیلتر نوع', 'Filter by type')}</Label>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">{tx('همه انواع', 'All types')}</option>
              {STORAGE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {locale === 'en' ? s.en : s.value}
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

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
              <p className="text-xl font-bold num">{filtered.length}</p>
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
              {locale === 'en' ? 'Units in use' : 'واحدهای فعال'}
            </p>
            <p className="mt-1 text-sm font-bold leading-6">
              {[
                ...new Set(
                  filtered.flatMap((w) => [w.capacityUnit, ...w.stockUnits].filter(Boolean))
                ),
              ]
                .map((u) => unitLabel(u, locale))
                .join(' · ') || '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Card grid — always visible */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <Card className="sm:col-span-2 xl:col-span-3">
            <CardContent className="py-10 text-center text-sm text-slate-500">
              {locale === 'en' ? 'No storage matches filters' : 'ذخیره‌ای با این فیلتر یافت نشد'}
            </CardContent>
          </Card>
        ) : (
          filtered.map((w) => (
            <MobileRecordCard
              key={`card-${w.id}`}
              title={w.name}
              subtitle={portLabel(w.port, locale) || w.location}
              badge={<Badge variant="muted">{w.type || tx('ذخیره', 'Storage')}</Badge>}
              metrics={[
                {
                  label: tx('ظرفیت', 'Capacity'),
                  value: formatCapacity(w.capacity || 0, w.capacityUnit),
                },
                {
                  label: tx('موجودی', 'Stock'),
                  value:
                    w.stockUnits.length > 1
                      ? w.stockUnits
                          .map((u) => {
                            const q = lots
                              .filter((l) => l.warehouseId === w.id && l.unit === u)
                              .reduce((s, l) => s + l.qty, 0);
                            return formatCapacity(q, u);
                          })
                          .join(' · ')
                      : formatCapacity(w.totalQty, w.capacityUnit),
                },
              ]}
              extra={
                <>
                  <ExtraRow label={tx('بندر', 'Port')} value={portLabel(w.port, locale) || '—'} />
                  <ExtraRow
                    label={tx('واحد ظرفیت', 'Capacity unit')}
                    value={unitLabel(w.capacityUnit, locale)}
                  />
                  <ExtraRow label={t('colCompany')} value={w.company === 'arya' ? t('companyArya') : t('companyTurkmen')} />
                </>
              }
              footer={
                <Link href={`/dashboard/warehouses/${w.id}`}>
                  <Button size="sm" variant="outline">
                    {locale === 'en' ? 'Goods or cash' : 'جنسی یا نقدی'}
                  </Button>
                </Link>
              }
            />
          ))
        )}
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="bg-emerald-700 px-4 py-3 text-center text-lg font-bold text-white">
          {locale === 'en' ? 'Storage list' : 'فهرست ذخایر'}
        </div>
        <CardContent className="px-0 pb-4 pt-0">
          <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{locale === 'en' ? 'No.' : 'شماره'}</TableHead>
                      <TableHead>{locale === 'en' ? 'Account' : 'طرف حساب'}</TableHead>
                      <TableHead>{tx('بندر', 'Port')}</TableHead>
                      <TableHead>{locale === 'en' ? 'Type' : 'نوع'}</TableHead>
                      <TableHead>{tx('ظرفیت', 'Capacity')}</TableHead>
                      <TableHead>{tx('واحد', 'Unit')}</TableHead>
                      <TableHead className="text-center">{t('colActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableEmpty
                        colSpan={7}
                        message={
                          locale === 'en'
                            ? 'No storage accounts yet — create one'
                            : 'هنوز ذخیره‌ای ثبت نشده — یکی بسازید'
                        }
                      />
                    ) : null}
                    {filtered.map((w, i) => (
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
                        <TableCell>{portLabel(w.port, locale) || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="muted">
                            {w.type || (locale === 'en' ? 'Storage' : 'ذخیره')}
                          </Badge>
                        </TableCell>
                        <TableCell className="num font-semibold">
                          {formatNumber(w.capacity || 0, 0)}
                        </TableCell>
                        <TableCell>{unitLabel(w.capacityUnit, locale)}</TableCell>
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
        </CardContent>
      </div>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={locale === 'en' ? 'New storage' : 'ذخیره جدید'}
        size="lg"
        fields={[
          {
            key: 'name',
            label: locale === 'en' ? 'Account name' : 'طرف حساب / نام ذخیره',
            required: true,
          },
          {
            key: 'port',
            label: tx('بندر', 'Port'),
            type: 'select',
            required: true,
            options: portOptions,
          },
          {
            key: 'location',
            label: locale === 'en' ? 'Location detail' : 'محل دقیق',
            placeholder: locale === 'en' ? 'Optional detail' : 'جزئیات اختیاری',
          },
          {
            key: 'type',
            label: locale === 'en' ? 'Type' : 'نوع',
            type: 'select',
            options: STORAGE_TYPES.map((s) => ({
              value: s.value,
              label: locale === 'en' ? s.en : s.value,
            })),
          },
          {
            key: 'capacity',
            label: tx('ظرفیت', 'Capacity'),
            type: 'number',
            required: true,
          },
          {
            key: 'capacityUnit',
            label: tx('واحد ظرفیت', 'Capacity unit'),
            type: 'select',
            required: true,
            options: unitOptions,
          },
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
        initial={{
          type: 'مواد ارتزاقی',
          capacityUnit: 'تن',
          port: 'تورغندی',
          company: defaultCompany,
          capacity: '',
        }}
        submitLabel={t('save')}
        onSubmit={(v) => {
          const port = v.port || 'تورغندی';
          addWarehouse({
            name: v.name.trim(),
            port,
            location: (v.location || port).trim(),
            type: v.type || 'مواد ارتزاقی',
            company: (v.company as CompanyKey) || defaultCompany,
            capacity: Number(v.capacity || 0),
            capacityUnit: v.capacityUnit || 'تن',
            notes: v.notes || '',
          });
        }}
      />
    </div>
  );
}
