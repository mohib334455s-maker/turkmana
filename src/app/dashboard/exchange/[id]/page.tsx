'use client';

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Banknote,
  MessageCircle,
  Pencil,
  Phone,
  Printer,
  Wallet,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { CompactFormDialog } from '@/components/shared/compact-form-dialog';
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import type { ExchangeHouse } from '@/lib/demo-data';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import {
  drawerSourceLabel,
  txnKindLabel,
  type CashDrawerSource,
  type ExchangeTxn,
  type ExchangeTxnKind,
} from '@/lib/exchange-ledger';
import { exportExchangeRemittance } from '@/lib/export';
import { notifyAdminChange } from '@/lib/activity-store';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';
import { RelatedJournal } from '@/components/journal/related-journal';
import { todayIso } from '@/lib/purchase-flow';
import { companyBrandName } from '@/lib/brand';

const EMPTY: OpsRow[] = [];

type FormKind = 'profile' | ExchangeTxnKind | null;

function kindBadgeVariant(kind: ExchangeTxnKind) {
  if (kind === 'remittance_in') return 'success' as const;
  if (kind === 'cash_withdrawal') return 'warning' as const;
  return 'muted' as const;
}

export default function ExchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const houseId = Number(id);
  const { t, locale, tx } = useI18n();
  const { company } = useCompanyStore();
  const houses = useOpsStore(
    (s) => (s.lists.exchangeHouses ?? EMPTY) as unknown as ExchangeHouse[]
  );
  const allTxns = useOpsStore((s) => s.exchangeTxns);
  const updateInList = useOpsStore((s) => s.updateInList);
  const addExchangeTxn = useOpsStore((s) => s.addExchangeTxn);
  const [formKind, setFormKind] = useState<FormKind>(null);

  const house = houses.find((h) => h.id === houseId);
  const otherHouses = houses.filter(
    (h) => h.id !== houseId && matchesCompany(h.company, company)
  );

  const txns = useMemo(
    () =>
      allTxns
        .filter((t) => t.houseId === houseId && matchesCompany(t.company, company))
        .sort((a, b) => b.number - a.number),
    [allTxns, houseId, company]
  );

  const drawerOptions = useMemo(
    () => [
      { value: 'exchanger_drawer', label: drawerSourceLabel('exchanger_drawer', locale) },
      { value: 'treasury', label: drawerSourceLabel('treasury', locale) },
      { value: 'joint', label: drawerSourceLabel('joint', locale) },
      { value: 'cash_register', label: drawerSourceLabel('cash_register', locale) },
      { value: 'other_house', label: drawerSourceLabel('other_house', locale) },
    ],
    [locale]
  );

  const printTxn = (txn: ExchangeTxn) => {
    if (!house) return;
    let drawer = drawerSourceLabel(txn.drawerSource, locale, txn.drawerSourceLabel);
    if (txn.drawerSourceHouseId) {
      const src = houses.find((h) => h.id === txn.drawerSourceHouseId);
      if (src) drawer = `${drawer} — ${src.name}`;
    }
    void exportExchangeRemittance({
      houseName: house.name,
      housePhone: house.phone,
      houseWhatsapp: house.whatsapp,
      houseLocation: house.location,
      company: txn.company,
      remittanceNo: txn.remittanceNo,
      dateJalali: txn.dateJalali,
      dateGregorian: txn.dateGregorian,
      kind: txnKindLabel(txn.kind, locale),
      counterparty: txn.counterparty,
      details: txn.details,
      currency: txn.currency,
      received: txn.received,
      paid: txn.paid,
      balance: txn.balance,
      drawerSource: drawer,
      rate: txn.rate,
      commission: txn.commission,
      notes: txn.notes,
    });
  };

  if (!house) {
    return (
      <div className="space-y-4">
        <p>{tx('صرافی یافت نشد.', 'Exchange house not found.')}</p>
        <Link href="/dashboard/exchange">
          <Button variant="outline">{t('back')}</Button>
        </Link>
      </div>
    );
  }

  const totalIn = txns.reduce((s, t) => s + t.received, 0);
  const totalOut = txns.reduce((s, t) => s + t.paid, 0);

  const exportRows = txns.map((t) => ({
    number: t.number,
    kind: txnKindLabel(t.kind, locale),
    dateJalali: t.dateJalali,
    remittanceNo: t.remittanceNo,
    counterparty: t.counterparty,
    drawer: drawerSourceLabel(t.drawerSource, locale, t.drawerSourceLabel),
    received: t.received || '',
    paid: t.paid || '',
    balance: t.balance,
    details: t.details,
  }));

  const txnFormTitle: Record<ExchangeTxnKind, string> = {
    remittance_in: tx('ثبت دریافت / حواله ورودی', 'Record incoming remittance'),
    remittance_out: tx('ثبت پرداخت / حواله خروجی', 'Record outgoing remittance'),
    cash_withdrawal: tx('برداشت نقدی', 'Cash withdrawal'),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={house.name.startsWith('صرافی') ? house.name : `صرافی ${house.name}`}
        description={tx(
          'پروفایل، برداشت نقدی، حواله و چاپ حرفه‌ای سند',
          'Profile, cash withdrawals, remittances and printable slips'
        )}
        actions={
          <>
            <ExportButtons
              filename={`exchange-${house.id}`}
              title={tx(`حساب ${house.name}`, `Account ${house.name}`)}
              company={company}
              subtitle={companyBrandName(company, locale)}
              columns={[
                { key: 'number', label: tx('شماره', 'No.') },
                { key: 'kind', label: tx('نوع', 'Type') },
                { key: 'dateJalali', label: tx('تاریخ', 'Date') },
                { key: 'remittanceNo', label: tx('نمبر حواله', 'Remittance') },
                { key: 'counterparty', label: tx('طرف', 'Party') },
                { key: 'drawer', label: tx('منبع / درک', 'Drawer') },
                { key: 'received', label: tx('دریافت', 'In') },
                { key: 'paid', label: tx('پرداخت', 'Out') },
                { key: 'balance', label: tx('مانده', 'Balance') },
              ]}
              rows={exportRows}
            />
            <CompanySwitcher />
            <Link href="/dashboard/exchange">
              <Button variant="outline" size="sm">
                <ArrowRight className="ml-2 h-4 w-4" />
                {t('back')}
              </Button>
            </Link>
          </>
        }
      />

      {/* Profile */}
      <Card className="overflow-hidden rounded-[22px] border-slate-200">
        <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/60 pb-4">
          <div>
            <CardTitle className="text-lg">{tx('پروفایل صرافی', 'Exchange profile')}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{house.location || tx('محل ثبت نشده', 'No location')}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setFormKind('profile')}>
            <Pencil className="ml-2 h-4 w-4" />
            {tx('ویرایش', 'Edit')}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-teal-600" />
            <div>
              <p className="text-xs text-slate-500">{tx('تماس', 'Phone')}</p>
              <p className="num font-semibold text-slate-800">{house.phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500">WhatsApp</p>
              <p className="num font-semibold text-slate-800">{house.whatsapp || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500">{tx('مسئول / تماس‌گیرنده', 'Contact person')}</p>
            <p className="font-semibold text-slate-800">{house.contactPerson || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">{tx('آدرس', 'Address')}</p>
            <p className="text-sm text-slate-700">{house.address || '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs + actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('مجموع دریافت', 'Total received')}</p>
            <p className="mt-1 text-xl font-bold num text-emerald-700">{formatCurrency(totalIn)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('مجموع پرداخت', 'Total paid')}</p>
            <p className="mt-1 text-xl font-bold num text-red-600">{formatCurrency(totalOut)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('مانده کل', 'Balance')}</p>
            <p className={cn('mt-1 text-xl font-bold num', balanceClass(house.balance))}>
              {formatCurrency(house.balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">{tx('ارز', 'Currency')}</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{house.currency}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setFormKind('cash_withdrawal')}>
          <Wallet className="ml-2 h-4 w-4" />
          {tx('برداشت نقدی', 'Cash withdrawal')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setFormKind('remittance_in')}>
          <Banknote className="ml-2 h-4 w-4" />
          {tx('دریافت حواله', 'Incoming remittance')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setFormKind('remittance_out')}>
          <Banknote className="ml-2 h-4 w-4" />
          {tx('پرداخت حواله', 'Outgoing remittance')}
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{tx('همه', 'All')}</TabsTrigger>
          <TabsTrigger value="in">{tx('دریافت‌ها', 'Incoming')}</TabsTrigger>
          <TabsTrigger value="out">{tx('پرداخت‌ها', 'Outgoing')}</TabsTrigger>
          <TabsTrigger value="withdrawals">{tx('برداشت نقدی', 'Withdrawals')}</TabsTrigger>
        </TabsList>

        {(['all', 'in', 'out', 'withdrawals'] as const).map((tab) => {
          const filtered =
            tab === 'all'
              ? txns
              : tab === 'in'
                ? txns.filter((t) => t.received > 0)
                : tab === 'out'
                  ? txns.filter((t) => t.paid > 0 && t.kind !== 'cash_withdrawal')
                  : txns.filter((t) => t.kind === 'cash_withdrawal');
          return (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {tx('دفتر', 'Ledger')} {house.name}
                    <Badge variant="muted">{house.currency}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-4 lg:pb-0">
                  <ResponsiveData
                    table={
                      <div className="table-scroll">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{tx('شماره', 'No.')}</TableHead>
                              <TableHead>{tx('نوع', 'Type')}</TableHead>
                              <TableHead>{tx('تاریخ', 'Date')}</TableHead>
                              <TableHead>{tx('حواله', 'Remittance')}</TableHead>
                              <TableHead>{tx('طرف', 'Party')}</TableHead>
                              <TableHead>{tx('منبع / درک', 'Drawer')}</TableHead>
                              <TableHead>{tx('دریافت', 'In')}</TableHead>
                              <TableHead>{tx('پرداخت', 'Out')}</TableHead>
                              <TableHead>{tx('مانده', 'Balance')}</TableHead>
                              <TableHead className="text-end">{t('colActions')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filtered.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={10} className="py-10 text-center text-slate-500">
                                  {tx('تراکنشی ثبت نشده', 'No transactions yet')}
                                </TableCell>
                              </TableRow>
                            ) : null}
                            {filtered.map((t) => (
                              <TableRow key={t.id}>
                                <TableCell className="num font-medium">{t.number}</TableCell>
                                <TableCell>
                                  <Badge variant={kindBadgeVariant(t.kind)}>
                                    {txnKindLabel(t.kind, locale)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="num">{t.dateJalali}</TableCell>
                                <TableCell className="num">{t.remittanceNo}</TableCell>
                                <TableCell>{t.counterparty || '—'}</TableCell>
                                <TableCell className="max-w-[140px] truncate text-xs">
                                  {t.drawerSource
                                    ? drawerSourceLabel(t.drawerSource, locale, t.drawerSourceLabel)
                                    : '—'}
                                </TableCell>
                                <TableCell className="num text-emerald-700">
                                  {t.received ? formatCurrency(t.received) : '—'}
                                </TableCell>
                                <TableCell className="num text-red-600">
                                  {t.paid ? formatCurrency(t.paid) : '—'}
                                </TableCell>
                                <TableCell className={cn('num', balanceClass(t.balance))}>
                                  {formatCurrency(t.balance)}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    title={tx('چاپ سند', 'Print slip')}
                                    onClick={() => printTxn(t)}
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    }
                    cards={
                      filtered.length === 0 ? (
                        <p className="py-10 text-center text-sm text-slate-500">
                          {tx('تراکنشی ثبت نشده', 'No transactions yet')}
                        </p>
                      ) : (
                        filtered.map((t) => (
                          <MobileRecordCard
                            key={t.id}
                            title={t.details || t.counterparty || txnKindLabel(t.kind, locale)}
                            subtitle={`${t.remittanceNo} · ${t.dateJalali}`}
                            badge={
                              <Badge variant={kindBadgeVariant(t.kind)}>
                                {txnKindLabel(t.kind, locale)}
                              </Badge>
                            }
                            metrics={[
                              {
                                label: tx('دریافت', 'In'),
                                value: (
                                  <span className="text-emerald-700">
                                    {t.received ? formatCurrency(t.received) : '—'}
                                  </span>
                                ),
                              },
                              {
                                label: tx('پرداخت', 'Out'),
                                value: (
                                  <span className="text-red-600">
                                    {t.paid ? formatCurrency(t.paid) : '—'}
                                  </span>
                                ),
                              },
                              {
                                label: tx('مانده', 'Balance'),
                                value: (
                                  <span className={balanceClass(t.balance)}>
                                    {formatCurrency(t.balance)}
                                  </span>
                                ),
                              },
                            ]}
                            extra={
                              <>
                                <ExtraRow
                                  label={tx('منبع برداشت', 'Drawer')}
                                  value={drawerSourceLabel(t.drawerSource, locale, t.drawerSourceLabel)}
                                />
                                <ExtraRow label={tx('طرف', 'Party')} value={t.counterparty} />
                              </>
                            }
                            footer={
                              <Button size="sm" variant="outline" onClick={() => printTxn(t)}>
                                <Printer className="ml-2 h-4 w-4" />
                                {tx('چاپ', 'Print')}
                              </Button>
                            }
                          />
                        ))
                      )
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <RelatedJournal filter={{ exchangeId: houseId }} />

      {/* Profile edit */}
      <CompactFormDialog
        open={formKind === 'profile'}
        onClose={() => setFormKind(null)}
        title={tx('ویرایش پروفایل صرافی', 'Edit exchange profile')}
        size="lg"
        fields={[
          { key: 'name', label: tx('نام', 'Name'), required: true },
          { key: 'phone', label: tx('تماس', 'Phone'), placeholder: '+93...' },
          { key: 'whatsapp', label: 'WhatsApp', placeholder: '+93...' },
          { key: 'contactPerson', label: tx('مسئول', 'Contact person') },
          { key: 'address', label: tx('آدرس', 'Address') },
          { key: 'location', label: tx('محل', 'Location') },
          { key: 'notes', label: tx('یادداشت', 'Notes') },
        ]}
        initial={{
          name: house.name,
          phone: house.phone || '',
          whatsapp: house.whatsapp || '',
          contactPerson: house.contactPerson || '',
          address: house.address || '',
          location: house.location || '',
          notes: house.notes || '',
        }}
        submitLabel={t('save')}
        onSubmit={(v) => {
          const name = v.name.trim();
          updateInList('exchangeHouses', houseId, {
            name,
            phone: v.phone || '',
            whatsapp: v.whatsapp || '',
            contactPerson: v.contactPerson || '',
            address: v.address || '',
            location: v.location || '',
            notes: v.notes || '',
          });
          notifyAdminChange({
            action: 'update',
            module: 'exchange',
            moduleFa: 'صرافی‌ها',
            moduleEn: 'Exchange',
            entityLabelFa: 'پروفایل صرافی',
            entityLabelEn: 'exchange profile',
            entityName: name,
            detailsFa: `تماس: ${v.phone || '—'} · واتساپ: ${v.whatsapp || '—'}`,
            detailsEn: `Phone: ${v.phone || '—'} · WhatsApp: ${v.whatsapp || '—'}`,
          });
        }}
      />

      {/* Transaction forms */}
      {(['remittance_in', 'remittance_out', 'cash_withdrawal'] as const).map(
        (kind) => (
          <CompactFormDialog
            key={kind}
            open={formKind === kind}
            onClose={() => setFormKind(null)}
            title={txnFormTitle[kind]}
            size="lg"
            fields={[
              { key: 'date', label: tx('تاریخ', 'Date'), type: 'date', required: true },
              {
                key: 'amount',
                label: kind === 'remittance_in' ? tx('مبلغ دریافت', 'Amount received') : tx('مبلغ', 'Amount'),
                type: 'number',
                required: true,
              },
              { key: 'remittanceNo', label: tx('نمبر حواله', 'Remittance no.') },
              { key: 'counterparty', label: tx('طرف معامله', 'Counterparty') },
              { key: 'details', label: tx('تفصیلات', 'Details') },
              ...(kind !== 'remittance_in'
                ? [
                    {
                      key: 'drawerSource',
                      label: tx('برداشت از (درک / خزانه / صندوق)', 'Withdraw from (drawer)'),
                      type: 'select' as const,
                      options: drawerOptions,
                      required: true,
                    },
                    ...(otherHouses.length
                      ? [
                          {
                            key: 'drawerSourceHouseId',
                            label: tx('صرافی / خزانه مبدأ', 'Source house'),
                            type: 'select' as const,
                            options: [
                              { value: '', label: '—' },
                              ...otherHouses.map((h) => ({
                                value: String(h.id),
                                label: h.name,
                              })),
                            ],
                          },
                        ]
                      : []),
                  ]
                : []),
              { key: 'rate', label: tx('نرخ (اختیاری)', 'Rate (optional)'), type: 'number' },
              { key: 'commission', label: tx('کمیشن', 'Commission'), type: 'number' },
              { key: 'notes', label: tx('یادداشت', 'Notes') },
            ]}
            initial={{ date: todayIso(), amount: '', drawerSource: 'exchanger_drawer' }}
            submitLabel={t('save')}
            onSubmit={(v) => {
              const amount = Number(v.amount || 0);
              if (!amount) return;
              const received = kind === 'remittance_in' ? amount : 0;
              const paid = kind === 'remittance_in' ? 0 : amount;
              const txn = addExchangeTxn({
                houseId,
                dateIso: v.date || todayIso(),
                kind,
                received,
                paid,
                remittanceNo: v.remittanceNo || undefined,
                details: v.details || txnFormTitle[kind],
                counterparty: v.counterparty || '',
                currency: house.currency,
                drawerSource: paid > 0 ? (v.drawerSource as CashDrawerSource) : undefined,
                drawerSourceHouseId:
                  v.drawerSourceHouseId && paid > 0
                    ? Number(v.drawerSourceHouseId)
                    : undefined,
                rate: v.rate ? Number(v.rate) : undefined,
                commission: v.commission ? Number(v.commission) : undefined,
                company: company as 'arya' | 'turkmen',
                notes: v.notes || '',
              });
              if (txn) {
                notifyAdminChange({
                  action: 'txn',
                  module: 'exchange',
                  moduleFa: 'صرافی‌ها',
                  moduleEn: 'Exchange',
                  entityLabelFa: txnFormTitle[kind],
                  entityLabelEn: txnFormTitle[kind],
                  entityName: house.name,
                  detailsFa: `مبلغ ${formatCurrency(amount)} · حواله ${txn.remittanceNo}${
                    paid > 0
                      ? ` · منبع: ${drawerSourceLabel(
                          v.drawerSource as CashDrawerSource,
                          'fa'
                        )}`
                      : ''
                  }`,
                  detailsEn: `Amount ${formatCurrency(amount)} · remittance ${txn.remittanceNo}${
                    paid > 0
                      ? ` · drawer: ${drawerSourceLabel(
                          v.drawerSource as CashDrawerSource,
                          'en'
                        )}`
                      : ''
                  }`,
                });
              }
            }}
          />
        )
      )}
    </div>
  );
}
