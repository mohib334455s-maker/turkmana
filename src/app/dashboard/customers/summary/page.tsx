'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
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
import { ExtraRow, MobileRecordCard, ResponsiveData } from '@/components/shared/mobile-record-card';
import { TableEmpty } from '@/components/shared/table-empty';
import { COMPANY_LABELS, useCompanyStore } from '@/lib/company-store';
import { customerLedgers, customers, goodsValue, products, sumGoods } from '@/lib/demo-data';
import { balanceClass, formatCurrency, formatNumber } from '@/lib/utils';

function statusBadge(cash: number) {
  return (
    <Badge variant={cash < 0 ? 'danger' : 'success'}>
      {cash < 0 ? 'بدهکار' : 'بستانکار'}
    </Badge>
  );
}

function productMatrixFromLedger(customerId: number) {
  const ledger = customerLedgers[customerId] ?? [];
  const map = new Map<string, { purchase: number; loading: number; remaining: number }>();

  ledger.forEach((r) => {
    if (!r.product || r.product === '-') return;
    const prev = map.get(r.product) ?? { purchase: 0, loading: 0, remaining: 0 };
    map.set(r.product, {
      purchase: prev.purchase + (r.qty || 0),
      loading: prev.loading + (r.loading || 0),
      remaining: r.goodsBalance,
    });
  });

  return map;
}

export default function CustomersSummaryPage() {
  const { company } = useCompanyStore();
  const colSpan = 6 + products.length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="مشتریان شرکت و خلاصه جنس"
        description={`وضعیت حساب مشتری در هر دو شرکت + ماتریس خرید/بارگیری/باقی — فیلتر: ${COMPANY_LABELS[company]}`}
        actions={
          <>
            <ExportButtons
              filename="customers-summary"
              title="خلاصه حسابات مشتریان"
              columns={[
                { key: 'name', label: 'نام مشتری' },
                { key: 'cash', label: 'مانده نقدی' },
                { key: 'goodsVal', label: 'مانده جنسی' },
                ...products.map((p) => ({ key: p.code, label: p.name })),
                { key: 'aryaStatus', label: 'وضعیت آریا' },
                { key: 'turkStatus', label: 'وضعیت ترکمن' },
              ]}
              rows={customers.map((c) => {
                const aryaCash = c.companies.arya.cashBalance;
                const turkCash = c.companies.turkmen.cashBalance;
                const cash =
                  company === 'arya' ? aryaCash : company === 'turkmen' ? turkCash : aryaCash + turkCash;
                const goods =
                  company === 'arya'
                    ? c.companies.arya.goods
                    : company === 'turkmen'
                      ? c.companies.turkmen.goods
                      : sumGoods(c.companies.arya.goods, c.companies.turkmen.goods);
                return {
                  name: c.name,
                  cash,
                  goodsVal: goodsValue(goods),
                  ...Object.fromEntries(products.map((p) => [p.code, goods[p.code] ?? 0])),
                  aryaStatus: aryaCash < 0 ? 'بدهکار' : 'بستانکار',
                  turkStatus: turkCash < 0 ? 'بدهکار' : 'بستانکار',
                };
              })}
            />
            <CompanySwitcher />
            <Link href="/dashboard/customers">
              <Button variant="outline">لیست مشتریان</Button>
            </Link>
          </>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            نام مشتری · مانده نقدی · مانده جنسی · تفکیک کالا · وضعیت آریا / ترکمن
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-4 lg:pb-0">
          <ResponsiveData
            table={
              <div className="table-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام مشتری</TableHead>
                <TableHead>مانده نقدی</TableHead>
                <TableHead>مانده جنسی (ارزش)</TableHead>
                {products.map((p) => (
                  <TableHead key={p.code}>{p.name}</TableHead>
                ))}
                <TableHead>وضعیت آریا</TableHead>
                <TableHead>وضعیت ترکمن</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableEmpty colSpan={colSpan} message="هنوز مشتری برای خلاصه حساب ثبت نشده است" />
              ) : (
                customers.map((c) => {
                  const aryaCash = c.companies.arya.cashBalance;
                  const turkCash = c.companies.turkmen.cashBalance;
                  const cash =
                    company === 'arya'
                      ? aryaCash
                      : company === 'turkmen'
                        ? turkCash
                        : aryaCash + turkCash;
                  const goods =
                    company === 'arya'
                      ? c.companies.arya.goods
                      : company === 'turkmen'
                        ? c.companies.turkmen.goods
                        : sumGoods(c.companies.arya.goods, c.companies.turkmen.goods);
                  const goodsVal = goodsValue(goods);

                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold">{c.name}</TableCell>
                      <TableCell className={`num font-semibold ${balanceClass(cash)}`}>
                        {formatCurrency(cash)}
                      </TableCell>
                      <TableCell className="num">{formatCurrency(goodsVal)}</TableCell>
                      {products.map((p) => (
                        <TableCell key={p.code} className="num">
                          {company === 'both' ? (
                            <div className="space-y-0.5 text-xs">
                              <div>
                                <Badge variant="muted" className="ml-1">
                                  آ
                                </Badge>
                                {formatNumber(c.companies.arya.goods[p.code] ?? 0, 0)}
                              </div>
                              <div>
                                <Badge variant="info" className="ml-1">
                                  ت
                                </Badge>
                                {formatNumber(c.companies.turkmen.goods[p.code] ?? 0, 0)}
                              </div>
                            </div>
                          ) : (
                            formatNumber(goods[p.code] ?? 0, 0)
                          )}
                        </TableCell>
                      ))}
                      <TableCell>{statusBadge(aryaCash)}</TableCell>
                      <TableCell>{statusBadge(turkCash)}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/customers/${c.id}`}>
                          <Button size="icon" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
              </div>
            }
            cards={
              customers.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">هنوز مشتری برای خلاصه حساب ثبت نشده است</p>
              ) : (
                customers.map((c) => {
                  const aryaCash = c.companies.arya.cashBalance;
                  const turkCash = c.companies.turkmen.cashBalance;
                  const cash =
                    company === 'arya'
                      ? aryaCash
                      : company === 'turkmen'
                        ? turkCash
                        : aryaCash + turkCash;
                  const goods =
                    company === 'arya'
                      ? c.companies.arya.goods
                      : company === 'turkmen'
                        ? c.companies.turkmen.goods
                        : sumGoods(c.companies.arya.goods, c.companies.turkmen.goods);
                  const goodsVal = goodsValue(goods);
                  return (
                    <MobileRecordCard
                      key={c.id}
                      title={c.name}
                      subtitle={c.code}
                      badge={statusBadge(cash)}
                      metrics={[
                        {
                          label: 'مانده نقدی',
                          value: <span className={balanceClass(cash)}>{formatCurrency(cash)}</span>,
                        },
                        { label: 'مانده جنسی', value: formatCurrency(goodsVal) },
                        { label: 'وضعیت آریا', value: statusBadge(aryaCash) },
                        { label: 'وضعیت ترکمن', value: statusBadge(turkCash) },
                      ]}
                      extra={products.map((p) => (
                        <ExtraRow
                          key={p.code}
                          label={p.name}
                          value={
                            company === 'both'
                              ? `آ ${formatNumber(c.companies.arya.goods[p.code] ?? 0, 0)} · ت ${formatNumber(c.companies.turkmen.goods[p.code] ?? 0, 0)}`
                              : formatNumber(goods[p.code] ?? 0, 0)
                          }
                        />
                      ))}
                      footer={
                        <Link href={`/dashboard/customers/${c.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="ml-1 h-3.5 w-3.5" />
                            مشاهده جزئیات
                          </Button>
                        </Link>
                      }
                    />
                  );
                })
              )
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">ماتریس جنس — خرید / بارگیری / باقی (از دفتر مشتری)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-0 pb-4">
          {customers.map((c) => {
            const matrix = productMatrixFromLedger(c.id);
            const entries = [...matrix.entries()];
            if (!entries.length) return null;
            return (
              <div key={c.id} className="px-4">
                <div className="mb-2 flex items-center justify-between">
                  <Link
                    href={`/dashboard/customers/${c.id}`}
                    className="font-semibold text-[var(--brand)] hover:underline"
                  >
                    {c.name}
                  </Link>
                </div>
                <div className="table-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>کالا</TableHead>
                        <TableHead>خرید</TableHead>
                        <TableHead>بارگیری</TableHead>
                        <TableHead>باقی</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entries.map(([product, vals]) => (
                        <TableRow key={product}>
                          <TableCell>{product}</TableCell>
                          <TableCell className="num">{formatNumber(vals.purchase, 0)}</TableCell>
                          <TableCell className="num">{formatNumber(vals.loading, 0)}</TableCell>
                          <TableCell className="num font-semibold">
                            {formatNumber(vals.remaining, 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
