'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { exchangeTransactions, type ExchangeHouse } from '@/lib/demo-data';
import { useOpsStore, type OpsRow } from '@/lib/ops-store';
import { balanceClass, formatCurrency, formatNumber } from '@/lib/utils';
import { RelatedJournal } from '@/components/journal/related-journal';

const EMPTY: OpsRow[] = [];

export default function ExchangeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const houseId = Number(id);
  const { company } = useCompanyStore();
  const houses = useOpsStore(
    (s) => (s.lists.exchangeHouses ?? EMPTY) as unknown as ExchangeHouse[]
  );
  const house = houses.find((h) => h.id === houseId);
  const txns = (exchangeTransactions[houseId] ?? []).filter((t) =>
    matchesCompany(t.company, company)
  );

  if (!house) {
    return (
      <div className="space-y-4">
        <p>صرافی یافت نشد.</p>
        <Link href="/dashboard/exchange">
          <Button variant="outline">بازگشت</Button>
        </Link>
      </div>
    );
  }

  const totalIn = txns.reduce((s, t) => s + t.received, 0);
  const totalOut = txns.reduce((s, t) => s + t.paid, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={house.name}
        description="پروفایل کامل حواله‌ها، دریافت/پرداخت، نرخ و حساب هر شرکت"
        actions={
          <>
            <ExportButtons
              filename={`exchange-${house.id}`}
              title={`حساب ${house.name}`}
              columns={[
                { key: 'number', label: 'شماره' },
                { key: 'dateJalali', label: 'تاریخ شمسی' },
                { key: 'dateGregorian', label: 'تاریخ میلادی' },
                { key: 'remittanceNo', label: 'نمبر حواله' },
                { key: 'counterparty', label: 'طرف معامله' },
                { key: 'currency', label: 'ارز' },
                { key: 'received', label: 'دریافتی' },
                { key: 'paid', label: 'پرداختی' },
                { key: 'balance', label: 'بیلانس' },
                { key: 'principalAmount', label: 'مبلغ اصلی' },
                { key: 'convertedAmount', label: 'مبلغ تبدیل‌شده' },
                { key: 'rate', label: 'نرخ تبدیل' },
                { key: 'commission', label: 'کمیشن صرافی' },
              ]}
              rows={txns}
            />
            <CompanySwitcher />
            <Link href="/dashboard/exchange">
              <Button variant="outline" size="sm">
                <ArrowRight className="ml-2 h-4 w-4" />
                بازگشت
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">مجموع دریافت (فیلتر فعلی)</p>
            <p className="mt-1 text-xl font-bold num text-emerald-700">
              {formatCurrency(totalIn)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">مجموع پرداخت</p>
            <p className="mt-1 text-xl font-bold num text-red-600">
              {formatCurrency(totalOut)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">مانده کل</p>
            <p className={`mt-1 text-xl font-bold num ${balanceClass(house.balance)}`}>
              {formatCurrency(house.balance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">سود/زیان نرخ ارز</p>
            <p className={`mt-1 text-xl font-bold num ${balanceClass(house.fxPnl)}`}>
              {formatCurrency(house.fxPnl)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">همه تراکنش‌ها</TabsTrigger>
          <TabsTrigger value="in">دریافت‌ها</TabsTrigger>
          <TabsTrigger value="out">پرداخت‌ها / حواله‌ها</TabsTrigger>
        </TabsList>

        {(['all', 'in', 'out'] as const).map((tab) => {
          const filtered =
            tab === 'all'
              ? txns
              : tab === 'in'
                ? txns.filter((t) => t.received > 0)
                : txns.filter((t) => t.paid > 0);
          return (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    دفتر {house.name}
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
                        <TableHead>شماره</TableHead>
                        <TableHead>تاریخ شمسی</TableHead>
                        <TableHead>تاریخ میلادی</TableHead>
                        <TableHead>نمبر حواله</TableHead>
                        <TableHead>تفصیلات</TableHead>
                        <TableHead>طرف معامله</TableHead>
                        <TableHead>ارز</TableHead>
                        <TableHead>دریافتی</TableHead>
                        <TableHead>پرداختی</TableHead>
                        <TableHead>بیلانس</TableHead>
                        <TableHead>مبلغ اصلی</TableHead>
                        <TableHead>مبلغ تبدیل‌شده</TableHead>
                        <TableHead>نرخ تبدیل</TableHead>
                        <TableHead>کمیشن</TableHead>
                        <TableHead>شرکت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="num font-medium">{t.number}</TableCell>
                          <TableCell className="num">{t.dateJalali}</TableCell>
                          <TableCell className="num">{t.dateGregorian}</TableCell>
                          <TableCell className="num">{t.remittanceNo}</TableCell>
                          <TableCell className="whitespace-normal max-w-[180px]">
                            {t.details}
                          </TableCell>
                          <TableCell>{t.counterparty}</TableCell>
                          <TableCell className="num">{t.currency || house.currency}</TableCell>
                          <TableCell className="num text-emerald-700">
                            {t.received ? formatCurrency(t.received) : '-'}
                          </TableCell>
                          <TableCell className="num text-red-600">
                            {t.paid ? formatCurrency(t.paid) : '-'}
                          </TableCell>
                          <TableCell className={`num ${balanceClass(t.balance)}`}>
                            {formatCurrency(t.balance)}
                          </TableCell>
                          <TableCell className="num">
                            {t.principalAmount ? formatCurrency(t.principalAmount) : '-'}
                          </TableCell>
                          <TableCell className="num">
                            {t.convertedAmount ? formatNumber(t.convertedAmount, 0) : formatNumber(t.aedEquivalent, 0)}
                          </TableCell>
                          <TableCell className="num">{t.rate}</TableCell>
                          <TableCell className="num">
                            {t.commission ? formatCurrency(t.commission) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="info">
                              {t.company === 'arya' ? 'آریا' : 'ترکمن'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                      </div>
                    }
                    cards={
                      filtered.length === 0 ? (
                        <p className="py-10 text-center text-sm text-slate-500">تراکنشی یافت نشد</p>
                      ) : (
                        filtered.map((t) => (
                          <MobileRecordCard
                            key={t.id}
                            title={t.details || t.counterparty}
                            subtitle={`حواله ${t.remittanceNo} · ${t.dateJalali}`}
                            badge={
                              <Badge variant="info">{t.company === 'arya' ? 'آریا' : 'ترکمن'}</Badge>
                            }
                            metrics={[
                              {
                                label: 'دریافتی',
                                value: (
                                  <span className="text-emerald-700">
                                    {t.received ? formatCurrency(t.received) : '-'}
                                  </span>
                                ),
                              },
                              {
                                label: 'پرداختی',
                                value: (
                                  <span className="text-red-600">
                                    {t.paid ? formatCurrency(t.paid) : '-'}
                                  </span>
                                ),
                              },
                              {
                                label: 'بیلانس',
                                value: (
                                  <span className={balanceClass(t.balance)}>
                                    {formatCurrency(t.balance)}
                                  </span>
                                ),
                              },
                              { label: 'طرف معامله', value: t.counterparty },
                            ]}
                            extra={
                              <>
                                <ExtraRow label="شماره سند" value={t.number} />
                                <ExtraRow label="نرخ تبدیل" value={t.rate} />
                                <ExtraRow label="معادل ارزی" value={`${formatNumber(t.aedEquivalent, 0)} AED`} />
                                <ExtraRow label="تاریخ میلادی" value={t.dateGregorian} />
                              </>
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
    </div>
  );
}
