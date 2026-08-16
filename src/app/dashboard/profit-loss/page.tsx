'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  calculateProfitLoss,
  demoProfitLossRows,
  sumDomesticExpenses,
  sumForeignExpenses,
} from '@/lib/calculations/profit-loss';
import { balanceClass, formatCurrency, formatNumber } from '@/lib/utils';

export default function ProfitLossPage() {
  const computed = demoProfitLossRows.map((row) => ({
    row,
    result: calculateProfitLoss(row),
  }));

  const totals = computed.reduce(
    (acc, { row, result }) => ({
      purchaseQty: acc.purchaseQty + row.purchaseQty,
      purchaseAmount: acc.purchaseAmount + row.purchaseAmount,
      soldQty: acc.soldQty + row.soldQty,
      salesAmount: acc.salesAmount + row.salesAmount,
      expenses: acc.expenses + result.totalExpenses,
      profitLoss: acc.profitLoss + result.profitLoss,
      remainingValue: acc.remainingValue + result.remainingValueMarket,
    }),
    {
      purchaseQty: 0,
      purchaseAmount: 0,
      soldQty: 0,
      salesAmount: 0,
      expenses: 0,
      profitLoss: 0,
      remainingValue: 0,
    }
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="جزئیات بهای تمام‌شده، مفاد و ضرر"
        description="مقدار/مبلغ/اوسط خرید · مصارف خارجی و داخلی · ضایعات · قیمت تمام‌شده · فروش · مفاد/ضرر فی تن · P&L نهایی · سنجش موجودی با نرخ روز"
        actions={
          <ExportButtons
            filename="profit-loss"
            title="مفاد و ضرر"
            columns={[
              { key: 'product', label: 'کالا' },
              { key: 'purchaseQty', label: 'مقدار خرید' },
              { key: 'purchaseAmount', label: 'مبلغ خرید' },
              { key: 'avgPurchaseRate', label: 'اوسط نرخ خرید' },
              { key: 'foreignExpenses', label: 'مصارف خارجی' },
              { key: 'domesticExpenses', label: 'مصارف داخلی' },
              { key: 'wasteQty', label: 'ضایعات' },
              { key: 'landedCost', label: 'قیمت تمام‌شده' },
              { key: 'soldQty', label: 'مقدار فروش' },
              { key: 'salesAmount', label: 'مبلغ فروش' },
              { key: 'avgSalesRate', label: 'اوسط نرخ فروش' },
              { key: 'profitPerTon', label: 'مفاد/ضرر فی تن' },
              { key: 'profitLoss', label: 'Profit & Loss نهایی' },
              { key: 'remainingValueMarket', label: 'سنجش موجودی با نرخ روز' },
            ]}
            rows={computed.map(({ row, result }) => ({
              product: row.product,
              purchaseQty: row.purchaseQty,
              purchaseAmount: row.purchaseAmount,
              avgPurchaseRate: result.avgPurchaseRate,
              foreignExpenses: sumForeignExpenses(row.expenses),
              domesticExpenses: sumDomesticExpenses(row.expenses),
              wasteQty: row.wasteQty,
              landedCost: result.landedCost,
              soldQty: row.soldQty,
              salesAmount: row.salesAmount,
              avgSalesRate: result.avgSalesRate,
              profitPerTon: result.profitPerTon,
              profitLoss: result.profitLoss,
              remainingValueMarket: result.remainingValueMarket,
            }))}
          />
        }
      />

      {computed.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-slate-500">
            هنوز ردیف سود و ضرری ثبت نشده است. پس از ورود داده‌های واقعی، محاسبات اینجا نمایش داده می‌شود.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['جمع خرید', formatCurrency(totals.purchaseAmount)],
          ['جمع فروش', formatCurrency(totals.salesAmount)],
          ['جمع مصارف', formatCurrency(totals.expenses)],
          ['Profit & Loss نهایی', formatCurrency(totals.profitLoss)],
        ].map(([label, value]) => (
          <Card key={String(label)}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p
                className={`mt-1 text-xl font-bold num ${
                  label.toString().includes('Profit')
                    ? balanceClass(totals.profitLoss)
                    : ''
                }`}
              >
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {computed.map(({ row, result }) => {
        const foreign = sumForeignExpenses(row.expenses);
        const domestic = sumDomesticExpenses(row.expenses);
        return (
          <Card key={row.product}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {row.product}
                <Badge
                  variant={result.profitLoss >= 0 ? 'success' : 'danger'}
                >
                  {result.profitLoss >= 0 ? 'سود' : 'ضرر'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ['مقدار خرید', formatNumber(row.purchaseQty, 0)],
                  ['مبلغ خرید', formatCurrency(row.purchaseAmount)],
                  ['اوسط نرخ خرید', formatCurrency(result.avgPurchaseRate)],
                  ['مصارف خارجی', formatCurrency(foreign)],
                  ['مصارف داخلی', formatCurrency(domestic)],
                  ['ضایعات', formatNumber(row.wasteQty, 0)],
                  ['قیمت تمام‌شده', formatCurrency(result.landedCost)],
                  ['مقدار فروش', formatNumber(row.soldQty, 0)],
                  ['مبلغ فروش', formatCurrency(row.salesAmount)],
                  ['اوسط نرخ فروش', formatCurrency(result.avgSalesRate)],
                  ['مفاد/ضرر فی تن', formatCurrency(result.profitPerTon)],
                  ['Profit & Loss نهایی', formatCurrency(result.profitLoss)],
                  [
                    'سنجش موجودی با نرخ روز',
                    formatCurrency(result.remainingValueMarket),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <p className="text-xs text-slate-500">{label}</p>
                    <p className="mt-1 font-semibold num">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">
                    مصارف خارجی — {formatCurrency(foreign)}
                  </h4>
                  <Table>
                    <TableBody>
                      {(
                        [
                          ['ترانسپورت خارجی', row.expenses.transport],
                          ['کمیسیون بانکی', row.expenses.bankCommission],
                          ['راه‌آهن', row.expenses.railway],
                          ['کرایه موتر', row.expenses.truckRent],
                          ['ذخیره', row.expenses.storage],
                          ['جریمه', row.expenses.fine],
                          ['بارگیری', row.expenses.loading],
                          ['گمرک خارجی', row.expenses.foreignCustoms],
                          ['سایر', row.expenses.otherForeign],
                        ] as [string, number][]
                      ).map(([label, value]) => (
                        <TableRow key={label}>
                          <TableCell>{label}</TableCell>
                          <TableCell className="num text-left">
                            {formatCurrency(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">
                    مصارف داخلی — {formatCurrency(domestic)}
                  </h4>
                  <Table>
                    <TableBody>
                      {(
                        [
                          ['گمرک', row.expenses.customs],
                          ['تلکس', row.expenses.telex],
                          ['راه‌آهن', row.expenses.railwayLocal],
                          ['خدمات مواد نفتی', row.expenses.oilServices],
                          ['لابراتوار', row.expenses.lab],
                          ['جریمه توقف', row.expenses.demurrage],
                          ['خدمات بندری', row.expenses.port],
                          ['ترانسپورت', row.expenses.transportLocal],
                          ['ذخیره', row.expenses.storageLocal],
                          ['کمیسیون لیتری', row.expenses.literCommission],
                          ['حق‌الوزن', row.expenses.weighing],
                          ['هزینه انتقال', row.expenses.transfer],
                          ['مصارف دولتی', row.expenses.government],
                          ['مصارف قرارداد', row.expenses.contractCost],
                          ['مصارف دفتر', row.expenses.office],
                          ['سایر', row.expenses.otherLocal],
                        ] as [string, number][]
                      ).map(([label, value]) => (
                        <TableRow key={label}>
                          <TableCell>{label}</TableCell>
                          <TableCell className="num text-left">
                            {formatCurrency(value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="rounded-lg bg-[var(--brand)]/5 border border-[var(--brand)]/20 px-4 py-3 text-sm">
                جمع کل هزینه:{' '}
                <span className="font-bold num">
                  {formatCurrency(result.totalExpenses)}
                </span>{' '}
                | ارزش موجودی با نرخ تمام‌شده:{' '}
                <span className="font-bold num">
                  {formatCurrency(result.remainingValueCost)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
