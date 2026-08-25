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
import { useCompanyFormOptions } from '@/lib/use-company-form';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import type { CompanyKey } from '@/lib/demo-data';
import { notifyAdminChange } from '@/lib/activity-store';
import { useEnabledCurrencies } from '@/lib/currency-store';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

const EMPTY: OpsRow[] = [];

export type BankAccount = {
  id: number;
  name: string;
  bankName: string;
  accountNo: string;
  currency: string;
  balance: number;
  location?: string;
  phone?: string;
  company: CompanyKey;
  notes?: string;
};

export default function BanksPage() {
  const { t, locale, tx } = useI18n();
  const { company } = useCompanyStore();
  const { options: companyOptions, defaultCompany, showCompanyField } =
    useCompanyFormOptions();
  const currencies = useEnabledCurrencies(locale);
  const items = useOpsStore((s) => (s.lists.banks ?? EMPTY) as unknown as BankAccount[]);
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

  const totalBalance = rows.reduce((s, r) => s + (Number(r.balance) || 0), 0);

  const deleteBank = (bank: BankAccount) => {
    const ok = window.confirm(
      tx(`حذف حساب «${bank.name}»؟`, `Delete account “${bank.name}”?`)
    );
    if (!ok) return;
    removeFromList('banks', bank.id);
    notifyAdminChange({
      action: 'delete',
      module: 'banks',
      moduleFa: 'بانک‌ها',
      moduleEn: 'Banks',
      entityLabelFa: 'حساب بانکی',
      entityLabelEn: 'Bank account',
      entityName: bank.name,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tx('بانک‌ها', 'Banks')}
        description={tx(
          'حساب‌های بانکی شرکت — مثل صرافی، با ارز و بیلانس جدا',
          'Company bank accounts — like exchangers, with currency and balance'
        )}
        actions={
          <>
            <ExportButtons
              filename="banks"
              title={tx('بانک‌ها', 'Banks')}
              columns={[
                { key: 'name', label: tx('طرف حساب', 'Account') },
                { key: 'bankName', label: tx('نام بانک', 'Bank') },
                { key: 'accountNo', label: tx('شماره حساب', 'Account no.') },
                { key: 'currency', label: tx('ارز', 'Currency') },
                { key: 'balance', label: tx('بیلانس', 'Balance') },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Link href="/dashboard/exchange">
              <Button variant="outline">{tx('صرافی‌ها', 'Exchanges')}</Button>
            </Link>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="ms-2 h-4 w-4" />
              {tx('حساب بانکی جدید', 'New bank account')}
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="rounded-[22px] border-sky-200 bg-sky-50/50">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-sky-900">
              {tx('جمع بیلانس بانک‌ها', 'Total bank balances')}
            </p>
            <p className={cn('mt-3 text-2xl font-extrabold num', balanceClass(totalBalance))}>
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[22px] border-slate-200">
          <CardContent className="flex h-full items-center justify-between gap-3 p-5">
            <div>
              <p className="text-sm font-bold text-slate-800">
                {tx('ارتباط با صرافی', 'Linked with exchange')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {tx(
                  'بانک و صرافی در کنار هم برای نقدی و حواله.',
                  'Banks and exchangers side by side for cash and remittance.'
                )}
              </p>
            </div>
            <Link href="/dashboard/exchange">
              <Button size="sm" variant="outline">
                {tx('رفتن به صرافی', 'Go to exchange')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="bg-[#0f4c81] px-4 py-3 text-center text-lg font-bold text-white">
          {tx('حساب‌های بانکی', 'Bank accounts')}
        </div>
        <ResponsiveData
          breakpoint="md"
          table={
            <div className="table-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tx('شماره', 'No.')}</TableHead>
                    <TableHead>{tx('طرف حساب', 'Account')}</TableHead>
                    <TableHead>{tx('بانک', 'Bank')}</TableHead>
                    <TableHead>{tx('ارز', 'Currency')}</TableHead>
                    <TableHead>{tx('بیلانس', 'Balance')}</TableHead>
                    <TableHead>{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableEmpty
                      colSpan={6}
                      message={tx('هنوز حساب بانکی ثبت نشده', 'No bank accounts yet')}
                    />
                  ) : null}
                  {rows.map((b, i) => (
                    <TableRow key={b.id}>
                      <TableCell className="num">{i + 1}</TableCell>
                      <TableCell className="font-semibold">
                        {b.name}
                        {b.accountNo ? (
                          <p className="mt-0.5 text-[11px] font-normal text-slate-500 num">
                            {b.accountNo}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>{b.bankName || '—'}</TableCell>
                      <TableCell className="num">{b.currency}</TableCell>
                      <TableCell className={cn('num font-semibold', balanceClass(b.balance))}>
                        {formatCurrency(b.balance, b.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button size="icon" variant="ghost" title={t('details')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-rose-600"
                            onClick={() => deleteBank(b)}
                          >
                            <Trash2 className="h-4 w-4" />
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
            <div className="space-y-3 px-3 py-3">
              {rows.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  {tx('هنوز حساب بانکی ثبت نشده', 'No bank accounts yet')}
                </p>
              ) : (
                rows.map((b) => (
                  <MobileRecordCard
                    key={b.id}
                    title={b.name}
                    subtitle={b.bankName}
                    badge={<Badge variant="info">{b.currency}</Badge>}
                    metrics={[
                      {
                        label: tx('بیلانس', 'Balance'),
                        value: (
                          <span className={cn('num', balanceClass(b.balance))}>
                            {formatCurrency(b.balance, b.currency)}
                          </span>
                        ),
                      },
                      { label: tx('شماره حساب', 'A/C'), value: b.accountNo || '—' },
                    ]}
                    extra={
                      <>
                        <ExtraRow label={tx('تماس', 'Phone')} value={b.phone || '—'} />
                        <ExtraRow label={tx('محل', 'Location')} value={b.location || '—'} />
                      </>
                    }
                    footer={
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-700"
                        onClick={() => deleteBank(b)}
                      >
                        <Trash2 className="ms-2 h-4 w-4" />
                        {t('delete')}
                      </Button>
                    }
                  />
                ))
              )}
            </div>
          }
        />
      </div>

      <CompactFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={tx('حساب بانکی جدید', 'New bank account')}
        size="lg"
        fields={[
          { key: 'name', label: tx('نام / طرف حساب', 'Account name'), required: true },
          { key: 'bankName', label: tx('نام بانک', 'Bank name'), required: true },
          { key: 'accountNo', label: tx('شماره حساب', 'Account number'), dir: 'ltr' },
          {
            key: 'currency',
            label: tx('ارز', 'Currency'),
            type: 'select',
            options: currencies.map((c) => ({ value: c.code, label: c.label })),
          },
          { key: 'balance', label: tx('بیلانس اولیه', 'Opening balance'), type: 'number' },
          { key: 'location', label: tx('محل / شعبه', 'Branch / location') },
          { key: 'phone', label: tx('تماس', 'Phone') },
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
          currency: currencies[0]?.code || 'USD',
          balance: '0',
          company: defaultCompany,
        }}
        submitLabel={t('save')}
        onSubmit={(v) => {
          const name = v.name.trim();
          addToList('banks', {
            name,
            bankName: v.bankName.trim(),
            accountNo: v.accountNo.trim(),
            currency: v.currency || 'USD',
            balance: Number(v.balance || 0),
            location: v.location || '',
            phone: v.phone || '',
            company: (v.company as CompanyKey) || defaultCompany,
            notes: v.notes || '',
          });
          notifyAdminChange({
            action: 'create',
            module: 'banks',
            moduleFa: 'بانک‌ها',
            moduleEn: 'Banks',
            entityLabelFa: 'حساب بانکی',
            entityLabelEn: 'Bank account',
            entityName: name,
          });
        }}
      />
    </div>
  );
}
