'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { customerReceivablesMatrix } from '@/lib/demo-data';
import { balanceClass, formatCurrency, formatNumber } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';

const companyLabels = { arya: 'آریا', turkmen: 'ترکمن' } as const;

export default function ReceivablesMatrixPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');

  const rows = useMemo(
    () =>
      customerReceivablesMatrix.filter((r) =>
        search.trim() ? r.customer.includes(search.trim()) : true
      ),
    [search]
  );

  const exportRows = rows.map((r) => {
    const flat: Record<string, string | number> = {
      customer: r.customer,
      cashClaim: r.cashClaim,
    };
    (['arya', 'turkmen'] as const).forEach((co) => {
      Object.entries(r.companies[co]).forEach(([loc, products]) => {
        Object.entries(products).forEach(([sku, qty]) => {
          flat[`${co}|${loc}|${sku}`] = qty;
        });
      });
    });
    return flat;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('pageReceivablesMatrix')}
        description="طلب نقدی + ماتریس جنسی به تفکیک آریا / ترکمن × محل × کالا"
        actions={
          <>
            <ExportButtons
              filename="receivables-matrix"
              title="طلب مشتریان"
              columns={[
                { key: 'customer', label: 'مشتری' },
                { key: 'cashClaim', label: 'طلب نقدی' },
              ]}
              rows={exportRows}
            />
            <CompanySwitcher />
          </>
        }
      />

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="جستجوی نام مشتری..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-500">
              مشتری‌ای یافت نشد
            </CardContent>
          </Card>
        ) : (
          rows.map((r) => (
            <Card key={r.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    <Link
                      href={`/dashboard/customers/${r.customerId}`}
                      className="text-[var(--brand)] hover:underline"
                    >
                      {r.customer}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">طلب نقدی:</span>
                    <span className={`font-bold num ${balanceClass(r.cashClaim)}`}>
                      {formatCurrency(r.cashClaim)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-0 pb-4 lg:pb-0">
                <ResponsiveData
                  table={
                    <div className="space-y-4 px-4 pb-2">
                      {(['arya', 'turkmen'] as const).map((co) => {
                        const book = r.companies[co] as Record<string, Record<string, number>>;
                        const locs = Object.keys(book);
                        const skus = locs.length ? Object.keys(book[locs[0]] ?? {}) : [];
                        return (
                          <div key={co}>
                            <div className="mb-2">
                              <Badge variant={co === 'arya' ? 'info' : 'muted'}>
                                {companyLabels[co]}
                              </Badge>
                            </div>
                            <div className="table-scroll">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>محل</TableHead>
                                    {skus.map((sku) => (
                                      <TableHead key={sku}>{sku}</TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {locs.length === 0 ? (
                                    <TableEmpty colSpan={1 + skus.length} />
                                  ) : (
                                    locs.map((loc) => (
                                      <TableRow key={loc}>
                                        <TableCell className="font-medium">{loc}</TableCell>
                                        {skus.map((sku) => (
                                          <TableCell key={sku} className="num">
                                            {formatNumber(book[loc]?.[sku] ?? 0, 0)}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    ))
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  }
                  cards={
                    <MobileRecordCard
                      title={r.customer}
                      subtitle="ماتریس طلب جنسی"
                      badge={
                        <span className={`num font-semibold ${balanceClass(r.cashClaim)}`}>
                          {formatCurrency(r.cashClaim)}
                        </span>
                      }
                      metrics={[
                        {
                          label: 'طلب نقدی',
                          value: (
                            <span className={balanceClass(r.cashClaim)}>
                              {formatCurrency(r.cashClaim)}
                            </span>
                          ),
                        },
                      ]}
                      extra={(['arya', 'turkmen'] as const).flatMap((co) =>
                        Object.entries(r.companies[co]).flatMap(([loc, products]) =>
                          Object.entries(products)
                            .filter(([, qty]) => qty !== 0)
                            .map(([sku, qty]) => (
                              <ExtraRow
                                key={`${co}-${loc}-${sku}`}
                                label={`${companyLabels[co]} · ${loc} · ${sku}`}
                                value={formatNumber(qty, 0)}
                              />
                            ))
                        )
                      )}
                      footer={
                        <Link href={`/dashboard/customers/${r.customerId}`}>
                          <span className="text-sm text-[var(--brand)] hover:underline">
                            مشاهده مشتری
                          </span>
                        </Link>
                      }
                    />
                  }
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
