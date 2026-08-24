'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, Phone, Plus, Trash2 } from 'lucide-react';
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
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { TableEmpty } from '@/components/shared/table-empty';
import {
  ExtraRow,
  MobileRecordCard,
  ResponsiveData,
} from '@/components/shared/mobile-record-card';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import {
  summarizeExchangeBalances,
  type CompanyKey,
  type ExchangeAccountKind,
  type ExchangeHouse,
} from '@/lib/demo-data';
import { notifyAdminChange } from '@/lib/activity-store';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

const EMPTY: OpsRow[] = [];

function kindLabel(kind: ExchangeAccountKind | undefined, locale: string) {
  if (kind === 'joint') return locale === 'en' ? 'Joint account' : 'حساب مشترک';
  if (kind === 'treasury') return locale === 'en' ? 'Treasury' : 'خزانه';
  return locale === 'en' ? 'Exchanger' : 'صرافی';
}

function displayName(house: ExchangeHouse) {
  if ((house.kind ?? 'exchanger') !== 'exchanger') return house.name;
  return house.name.startsWith('صرافی') ? house.name : `صرافی ${house.name}`;
}

export default function ExchangePage() {
  const { t, locale, tx } = useI18n();
  const { company } = useCompanyStore();
  const items = useOpsStore((s) => (s.lists.exchangeHouses ?? EMPTY) as unknown as ExchangeHouse[]);
  const addToList = useOpsStore((s) => s.addToList);
  const removeFromList = useOpsStore((s) => s.removeFromList);
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === '1') setCreateOpen(true);
  }, [searchParams]);

  const rows = useMemo(
    () => items.filter((e) => matchesCompany(e.company, company)),
    [items, company]
  );

  const summary = useMemo(() => summarizeExchangeBalances(rows), [rows]);

  const deleteHouse = (house: ExchangeHouse) => {
    const ok = window.confirm(
      tx(
        `حذف «${displayName(house)}»؟ تراکنش‌های مرتبط هم پاک می‌شوند.`,
        `Delete “${displayName(house)}”? Related transactions will also be removed.`
      )
    );
    if (!ok) return;
    removeFromList('exchangeHouses', house.id);
    notifyAdminChange({
      action: 'delete',
      module: 'exchange',
      moduleFa: 'صرافی‌ها',
      moduleEn: 'Exchange',
      entityLabelFa: 'صرافی',
      entityLabelEn: 'exchange house',
      entityName: displayName(house),
      detailsFa: `بیلانس قبلی: ${formatCurrency(house.balance)}`,
      detailsEn: `Previous balance: ${formatCurrency(house.balance)}`,
    });
  };

  const houseActions = (house: ExchangeHouse) => (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/dashboard/exchange/${house.id}`}>
        <Button size="icon" variant="ghost" title={t('details')}>
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        size="icon"
        variant="ghost"
        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        title={t('delete')}
        onClick={() => deleteHouse(house)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderHouseRow = (house: ExchangeHouse, index?: number) => (
    <TableRow key={house.id} className={house.kind === 'joint' ? 'bg-amber-50/70' : undefined}>
      <TableCell className="num w-14 font-medium text-slate-500">
        {index != null ? index + 1 : '—'}
      </TableCell>
      <TableCell className="max-w-none font-semibold">
        <Link href={`/dashboard/exchange/${house.id}`} className="hover:text-teal-700">
          {displayName(house)}
        </Link>
        {house.phone ? (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-normal text-slate-500">
            <Phone className="h-3 w-3" />
            <span className="num">{house.phone}</span>
          </p>
        ) : null}
      </TableCell>
      <TableCell>
        <Badge
          variant={
            house.kind === 'joint' ? 'warning' : house.kind === 'treasury' ? 'info' : 'muted'
          }
        >
          {kindLabel(house.kind, locale)}
        </Badge>
      </TableCell>
      <TableCell className="num font-medium">{house.currency}</TableCell>
      <TableCell className={cn('num font-semibold', balanceClass(house.balance))}>
        {formatCurrency(house.balance)}
      </TableCell>
      <TableCell className="w-24">{houseActions(house)}</TableCell>
    </TableRow>
  );

  const summaryRow = (
    label: string,
    value: number,
    tone?: 'emerald' | 'rose' | 'sky' | 'skyStrong'
  ) => {
    const rowClass =
      tone === 'emerald'
        ? 'bg-emerald-50/80'
        : tone === 'rose'
          ? 'bg-rose-50/80'
          : tone === 'skyStrong'
            ? 'bg-sky-100 font-bold'
            : tone === 'sky'
              ? 'bg-sky-50 font-semibold'
              : '';
    const valueClass =
      tone === 'emerald'
        ? 'text-emerald-700'
        : tone === 'rose'
          ? 'text-rose-700'
          : balanceClass(value);
    return (
      <TableRow className={rowClass}>
        <TableCell />
        <TableCell colSpan={3} className={cn('font-bold', tone === 'emerald' && 'text-emerald-900', tone === 'rose' && 'text-rose-900')}>
          {label}
        </TableCell>
        <TableCell className={cn('num font-extrabold', valueClass)}>
          {formatCurrency(value)}
        </TableCell>
        <TableCell />
      </TableRow>
    );
  };

  const houseCard = (house: ExchangeHouse) => (
    <MobileRecordCard
      key={house.id}
      title={
        <Link href={`/dashboard/exchange/${house.id}`} className="hover:text-teal-700">
          {displayName(house)}
        </Link>
      }
      subtitle={house.location || house.contactPerson || undefined}
      badge={<Badge variant="muted">{kindLabel(house.kind, locale)}</Badge>}
      metrics={[
        {
          label: tx('بیلانس', 'Balance'),
          value: (
            <span className={cn('num', balanceClass(house.balance))}>
              {formatCurrency(house.balance)}
            </span>
          ),
        },
        { label: tx('ارز', 'Currency'), value: <span className="num">{house.currency}</span> },
      ]}
      extra={
        <>
          <ExtraRow label={tx('تماس', 'Phone')} value={house.phone || '—'} />
          <ExtraRow label="WhatsApp" value={house.whatsapp || '—'} />
          <ExtraRow label={tx('مسئول', 'Contact')} value={house.contactPerson || '—'} />
          <ExtraRow label={tx('آدرس', 'Address')} value={house.address || '—'} />
        </>
      }
      footer={
        <>
          <Link href={`/dashboard/exchange/${house.id}`}>
            <Button size="sm" variant="outline">
              <Eye className="ml-2 h-4 w-4" />
              {t('details')}
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="text-rose-700" onClick={() => deleteHouse(house)}>
            <Trash2 className="ml-2 h-4 w-4" />
            {t('delete')}
          </Button>
        </>
      }
    />
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageExchange')}
        description={tx(
          'حساب‌های نقدی صرافی — طلب بالای صرافی و باقیات از صرافی جدا گزارش می‌شود.',
          'Cash accounts with exchangers — claims and dues are reported separately.'
        )}
        actions={
          <>
            <ExportButtons
              filename="exchange-houses"
              title={tx('حساب‌های نقدی', 'Cash accounts')}
              columns={[
                { key: 'name', label: tx('طرف حساب', 'Account') },
                { key: 'kind', label: tx('نوع', 'Kind') },
                { key: 'currency', label: tx('ارز', 'Currency') },
                { key: 'balance', label: tx('بیلانس', 'Balance') },
                { key: 'phone', label: tx('تماس', 'Phone') },
              ]}
              rows={rows.map((r) => ({
                ...r,
                kind: kindLabel(r.kind, locale),
              }))}
            />
            <CompanySwitcher />
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              {tx('حساب جدید', 'New account')}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="overflow-hidden rounded-[22px] border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-emerald-900">
              {tx('جمله طلب بالای صرافی‌ها', 'Total claims on exchangers')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
              {tx(
                'پول یا طلبی که بالای صرافی داریم (بیلانس مثبت).',
                'Money or claims we hold against exchangers (positive balance).'
              )}
            </p>
            <p className="mt-4 text-2xl font-extrabold num text-emerald-700">
              {formatCurrency(summary.claimsOnExchangers)}
            </p>
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-[22px] border-rose-200 bg-rose-50/50">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-rose-900">
              {tx('جمله باقیات از صرافی‌ها', 'Total dues from exchangers')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-rose-800/80">
              {tx(
                'باقیات / بدهی طرف ما نسبت به صرافی (بیلانس منفی).',
                'Amounts still due to exchangers (negative balance).'
              )}
            </p>
            <p className="mt-4 text-2xl font-extrabold num text-rose-700">
              {formatCurrency(summary.dueFromExchangers)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="bg-[#1e3a5f] px-4 py-3 text-start text-lg font-bold text-white">
          {tx('حساب‌های نقدی', 'Cash accounts')}
        </div>

        <ResponsiveData
          breakpoint="md"
          table={
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-14">{tx('شماره', 'No.')}</TableHead>
                    <TableHead>{tx('طرف حساب', 'Account')}</TableHead>
                    <TableHead>{tx('نوع', 'Kind')}</TableHead>
                    <TableHead>{tx('ارز', 'Currency')}</TableHead>
                    <TableHead>{tx('بیلانس', 'Balance')}</TableHead>
                    <TableHead className="w-24 text-end">{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.exchangers.length === 0 ? (
                    <TableEmpty
                      colSpan={6}
                      message={tx(
                        'هنوز صرافی ثبت نشده — یکی اضافه کنید.',
                        'No exchangers yet — add one.'
                      )}
                    />
                  ) : null}
                  {summary.exchangers.map((house, i) => renderHouseRow(house, i))}
                  {summaryRow(
                    tx('موجودی صرافی‌ها', 'Exchanger inventory'),
                    summary.exchangerInventory,
                    'sky'
                  )}
                  {summaryRow(
                    tx('جمله طلب بالای صرافی‌ها', 'Total claims on exchangers'),
                    summary.claimsOnExchangers,
                    'emerald'
                  )}
                  {summaryRow(
                    tx('جمله باقیات از صرافی‌ها', 'Total dues from exchangers'),
                    summary.dueFromExchangers,
                    'rose'
                  )}
                  {summary.joint.map((house) => renderHouseRow(house))}
                  {summary.treasury.map((house) => renderHouseRow(house))}
                  {summary.treasury.length === 0 ? (
                    <TableRow>
                      <TableCell />
                      <TableCell colSpan={3} className="text-slate-500">
                        {tx('موجودی خزانه', 'Treasury balance')}
                      </TableCell>
                      <TableCell className="num text-slate-400">—</TableCell>
                      <TableCell />
                    </TableRow>
                  ) : null}
                  {summaryRow(
                    tx('موجودی صرافی با خزانه', 'Exchanger + treasury total'),
                    summary.exchangerPlusTreasury,
                    'skyStrong'
                  )}
                </TableBody>
              </Table>
            </div>
          }
          cards={
            <div className="space-y-3 px-3 py-3">
              {summary.exchangers.length === 0 &&
              summary.joint.length === 0 &&
              summary.treasury.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {tx('هنوز صرافی ثبت نشده — یکی اضافه کنید.', 'No exchangers yet — add one.')}
                </p>
              ) : null}
              {[...summary.exchangers, ...summary.joint, ...summary.treasury].map(houseCard)}
              <Card className="rounded-2xl border-slate-200 bg-slate-50">
                <CardContent className="space-y-2 p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-600">{tx('موجودی صرافی‌ها', 'Exchanger inventory')}</span>
                    <span className={cn('num font-bold', balanceClass(summary.exchangerInventory))}>
                      {formatCurrency(summary.exchangerInventory)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-emerald-800">
                    <span>{tx('جمله طلب بالای صرافی‌ها', 'Total claims')}</span>
                    <span className="num font-bold">{formatCurrency(summary.claimsOnExchangers)}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-rose-800">
                    <span>{tx('جمله باقیات از صرافی‌ها', 'Total dues')}</span>
                    <span className="num font-bold">{formatCurrency(summary.dueFromExchangers)}</span>
                  </div>
                  <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 font-bold">
                    <span>{tx('موجودی صرافی با خزانه', 'Exchanger + treasury')}</span>
                    <span className={cn('num', balanceClass(summary.exchangerPlusTreasury))}>
                      {formatCurrency(summary.exchangerPlusTreasury)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        />
      </div>

      <p className="text-sm leading-relaxed text-slate-500">
        {tx(
          'توجه: «طلب بالای صرافی» و «باقیات از صرافی» دو راپور جدا هستند و با هم جمع نمی‌شوند.',
          'Note: claims and dues are two separate reports and are not summed together.'
        )}
      </p>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={tx('حساب نقدی جدید', 'New cash account')}
        size="lg"
        fields={[
          { key: 'name', label: tx('نام / طرف حساب', 'Name / account'), required: true },
          {
            key: 'kind',
            label: tx('نوع حساب', 'Account kind'),
            type: 'select',
            options: [
              { value: 'exchanger', label: tx('صرافی', 'Exchanger') },
              { value: 'joint', label: tx('حساب مشترک', 'Joint account') },
              { value: 'treasury', label: tx('خزانه', 'Treasury') },
            ],
          },
          { key: 'currency', label: tx('ارز', 'Currency'), placeholder: 'USD' },
          { key: 'balance', label: tx('بیلانس اولیه', 'Opening balance'), type: 'number' },
          { key: 'location', label: tx('محل', 'Location'), placeholder: 'کابل / دبی / مسکو' },
          { key: 'phone', label: tx('تماس', 'Phone'), placeholder: '+93...' },
          { key: 'whatsapp', label: 'WhatsApp', placeholder: '+93...' },
          { key: 'contactPerson', label: tx('مسئول', 'Contact person') },
          { key: 'address', label: tx('آدرس', 'Address') },
          {
            key: 'company',
            label: t('colCompany'),
            type: 'select',
            options: [
              { value: 'arya', label: t('companyArya') },
              { value: 'turkmen', label: t('companyTurkmen') },
            ],
          },
        ]}
        initial={{ kind: 'exchanger', currency: 'USD', balance: '0', company: 'arya' }}
        submitLabel={t('save')}
        onSubmit={(v) => {
          const kind = (v.kind as ExchangeAccountKind) || 'exchanger';
          const balance = Number(v.balance || 0);
          const name = v.name.trim();
          addToList('exchangeHouses', {
            name,
            currency: v.currency || 'USD',
            totalIn: balance > 0 ? balance : 0,
            totalOut: balance < 0 ? Math.abs(balance) : 0,
            balance,
            fxPnl: 0,
            company: (v.company as CompanyKey) || 'arya',
            kind,
            location: v.location || '',
            phone: v.phone || '',
            whatsapp: v.whatsapp || '',
            contactPerson: v.contactPerson || '',
            address: v.address || '',
            notes: '',
          });
          notifyAdminChange({
            action: 'create',
            module: 'exchange',
            moduleFa: 'صرافی‌ها',
            moduleEn: 'Exchange',
            entityLabelFa: kindLabel(kind, 'fa'),
            entityLabelEn: kindLabel(kind, 'en'),
            entityName: name,
            detailsFa: `بیلانس اولیه: ${formatCurrency(balance)} · ${v.currency || 'USD'}`,
            detailsEn: `Opening balance: ${formatCurrency(balance)} · ${v.currency || 'USD'}`,
          });
        }}
      />
    </div>
  );
}
