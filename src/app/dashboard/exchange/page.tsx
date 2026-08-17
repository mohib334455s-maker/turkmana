'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, Plus } from 'lucide-react';
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
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import {
  summarizeExchangeBalances,
  type CompanyKey,
  type ExchangeAccountKind,
  type ExchangeHouse,
} from '@/lib/demo-data';
import { balanceClass, cn, formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

const EMPTY: OpsRow[] = [];

function kindLabel(kind: ExchangeAccountKind | undefined, locale: string) {
  if (kind === 'joint') return locale === 'en' ? 'Joint account' : 'حساب مشترک';
  if (kind === 'treasury') return locale === 'en' ? 'Treasury' : 'خزانه';
  return locale === 'en' ? 'Exchanger' : 'صرافی';
}

export default function ExchangePage() {
  const { t, locale, tx } = useI18n();
  const { company } = useCompanyStore();
  const items = useOpsStore((s) => (s.lists.exchangeHouses ?? EMPTY) as unknown as ExchangeHouse[]);
  const addToList = useOpsStore((s) => s.addToList);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageExchange')}
        description={tx(
          'حساب‌های نقدی صرافی — طلب بالای صرافی و باقیات از صرافی جدا گزارش می‌شود، یکجا جمع نمی‌شود.',
          'Cash accounts with exchangers — claims on exchangers and amounts due from exchangers are reported separately, never as one mixed total.'
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
                { key: 'totalIn', label: tx('دریافت', 'Received') },
                { key: 'totalOut', label: tx('پرداخت', 'Paid') },
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

      {/* دو جمع جدا — درخواست کارفرما */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="overflow-hidden rounded-[22px] border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-emerald-900">
              {tx('جمله طلب بالای صرافی‌ها', 'Total claims on exchangers')}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-800/80">
              {tx(
                'پول یا طلبی که بالای صرافی داریم (بیلانس مثبت). با باقیات قاطی نمی‌شود.',
                'Money or claims we hold against exchangers (positive balance). Not mixed with dues.'
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
                'باقیات / بدهی طرف ما نسبت به صرافی (بیلانس منفی). جدا از طلب گزارش می‌شود.',
                'Amounts still due / our payable to exchangers (negative balance). Reported apart from claims.'
              )}
            </p>
            <p className="mt-4 text-2xl font-extrabold num text-rose-700">
              {formatCurrency(summary.dueFromExchangers)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
        <div className="bg-[#1e3a5f] px-4 py-3 text-center text-lg font-bold text-white">
          {tx('حساب‌های نقدی', 'Cash accounts')}
        </div>

        <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{tx('شماره', 'No.')}</TableHead>
                <TableHead>{tx('طرف حساب', 'Account')}</TableHead>
                <TableHead>{tx('نوع', 'Kind')}</TableHead>
                <TableHead>{tx('ارز', 'Currency')}</TableHead>
                <TableHead>{tx('بیلانس', 'Balance')}</TableHead>
                <TableHead className="text-center">{t('colActions')}</TableHead>
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
              {summary.exchangers.map((house, i) => (
                <TableRow key={house.id}>
                  <TableCell className="num">{i + 1}</TableCell>
                  <TableCell>
                    <Link
                      href={`/dashboard/exchange/${house.id}`}
                      className="font-semibold text-slate-900 hover:text-teal-700"
                    >
                      {house.name.startsWith('صرافی') ? house.name : `صرافی ${house.name}`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="muted">{kindLabel(house.kind, locale)}</Badge>
                  </TableCell>
                  <TableCell>{house.currency}</TableCell>
                  <TableCell className={cn('num font-semibold', balanceClass(house.balance))}>
                    {formatCurrency(house.balance)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/exchange/${house.id}`}>
                      <Button size="icon" variant="ghost" title={t('details')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-sky-50 font-semibold">
                <TableCell />
                <TableCell colSpan={3}>{tx('موجودی صرافی‌ها', 'Exchanger inventory')}</TableCell>
                <TableCell className={cn('num', balanceClass(summary.exchangerInventory))}>
                  {formatCurrency(summary.exchangerInventory)}
                </TableCell>
                <TableCell />
              </TableRow>

              {/* دو ردیف جدا — عین درخواست کارفرما */}
              <TableRow className="bg-emerald-50/80">
                <TableCell />
                <TableCell colSpan={3} className="font-bold text-emerald-900">
                  {tx('جمله طلب بالای صرافی‌ها', 'Total claims on exchangers')}
                </TableCell>
                <TableCell className="num font-extrabold text-emerald-700">
                  {formatCurrency(summary.claimsOnExchangers)}
                </TableCell>
                <TableCell />
              </TableRow>
              <TableRow className="bg-rose-50/80">
                <TableCell />
                <TableCell colSpan={3} className="font-bold text-rose-900">
                  {tx('جمله باقیات از صرافی‌ها', 'Total dues from exchangers')}
                </TableCell>
                <TableCell className="num font-extrabold text-rose-700">
                  {formatCurrency(summary.dueFromExchangers)}
                </TableCell>
                <TableCell />
              </TableRow>

              {summary.joint.map((house) => (
                <TableRow key={house.id} className="bg-amber-50">
                  <TableCell />
                  <TableCell>
                    <Link
                      href={`/dashboard/exchange/${house.id}`}
                      className="font-semibold hover:text-teal-700"
                    >
                      {house.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">{kindLabel('joint', locale)}</Badge>
                  </TableCell>
                  <TableCell>{house.currency}</TableCell>
                  <TableCell className={cn('num font-semibold', balanceClass(house.balance))}>
                    {formatCurrency(house.balance)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/exchange/${house.id}`}>
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {summary.treasury.map((house) => (
                <TableRow key={house.id}>
                  <TableCell />
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/exchange/${house.id}`} className="hover:text-teal-700">
                      {house.name || tx('موجودی خزانه', 'Treasury balance')}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{kindLabel('treasury', locale)}</Badge>
                  </TableCell>
                  <TableCell>{house.currency}</TableCell>
                  <TableCell className={cn('num font-semibold', balanceClass(house.balance))}>
                    {formatCurrency(house.balance)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/exchange/${house.id}`}>
                      <Button size="icon" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

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

              <TableRow className="bg-sky-100 font-bold">
                <TableCell />
                <TableCell colSpan={3}>
                  {tx('موجودی صرافی با خزانه', 'Exchanger + treasury total')}
                </TableCell>
                <TableCell className={cn('num', balanceClass(summary.exchangerPlusTreasury))}>
                  {formatCurrency(summary.exchangerPlusTreasury)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-500">
        {tx(
          'توجه: «طلب بالای صرافی» و «باقیات از صرافی» دو راپور جدا هستند و با هم جمع نمی‌شوند. موجودی صرافی با خزانه فقط برای خلاصه نقدی است.',
          'Note: claims on exchangers and dues from exchangers are two separate reports and are not summed together. Exchanger + treasury is only a cash overview.'
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
          addToList('exchangeHouses', {
            name: v.name.trim(),
            currency: v.currency || 'USD',
            totalIn: balance > 0 ? balance : 0,
            totalOut: balance < 0 ? Math.abs(balance) : 0,
            balance,
            fxPnl: 0,
            company: (v.company as CompanyKey) || 'arya',
            kind,
            location: v.location || '',
            notes: '',
          });
        }}
      />
    </div>
  );
}
