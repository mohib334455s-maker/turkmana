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
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { COMPANY_LABELS, useCompanyStore } from '@/lib/company-store';
import { balanceSheetAccounts, financialSummary } from '@/lib/demo-data';
import { balanceClass, formatCurrency } from '@/lib/utils';

const expenseLabels: Record<string, string> = {
  bankCommission: 'کمیسیون بانک',
  transport: 'حمل‌ونقل',
  trading: 'مصارف تجارتی',
  misc: 'متفرقه',
  total: 'جمع مصارف',
};

export default function BalanceSheetPage() {
  const { company } = useCompanyStore();
  const summary = financialSummary[company];

  const tradeRows = balanceSheetAccounts.trade.map((row) => ({
    title: row.titleFa,
    amount: summary[row.amountKey],
  }));

  const assetRows = [
    ...balanceSheetAccounts.assets.map((row) => ({
      title: row.titleFa,
      type: row.type,
      balance: summary[row.amountKey],
      currency: row.currency,
    })),
    {
      title: 'طلحات مشتریان',
      type: 'طلب',
      balance: summary.customerBalance,
      currency: 'USD',
    },
  ];

  const expenseEntries = Object.entries(summary.expenses).filter(([k]) => k !== 'total');

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="بیلانس عمومی شرکت"
        description={`خلاصه بیلانس خرید/فروش، دارایی‌ها و مصارف — ${COMPANY_LABELS[company]}`}
        actions={
          <>
            <ExportButtons
              filename="balance-sheet"
              title="بیلانس عمومی"
              columns={[
                { key: 'section', label: 'بخش' },
                { key: 'title', label: 'عنوان' },
                { key: 'amount', label: 'مبلغ' },
              ]}
              rows={[
                ...tradeRows.map((r) => ({ section: 'تجارت', title: r.title, amount: r.amount })),
                ...assetRows.map((r) => ({ section: 'دارایی', title: r.title, amount: r.balance })),
                ...expenseEntries.map(([k, v]) => ({
                  section: 'مصارف',
                  title: expenseLabels[k] ?? k,
                  amount: v,
                })),
              ]}
            />
            <CompanySwitcher />
          </>
        }
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">بیلانس خرید / فروش / مشتری + مفاد ناخالص/خالص</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>مبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tradeRows.map((r) => (
                  <TableRow key={r.title}>
                    <TableCell>{r.title}</TableCell>
                    <TableCell className={`num font-semibold ${balanceClass(r.amount)}`}>
                      {formatCurrency(r.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50">
                  <TableCell className="font-semibold">مفاد / ضرر خالص</TableCell>
                  <TableCell className={`num font-bold ${balanceClass(summary.profitLoss)}`}>
                    {formatCurrency(summary.profitLoss)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">بانک‌ها، صرافی، ذخایر، طلبات</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>حساب</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>بیلانس</TableHead>
                  <TableHead>ارز</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assetRows.map((r) => (
                  <TableRow key={`${r.title}-${r.type}`}>
                    <TableCell>{r.title}</TableCell>
                    <TableCell>
                      <Badge variant="muted">{r.type}</Badge>
                    </TableCell>
                    <TableCell className={`num font-semibold ${balanceClass(r.balance)}`}>
                      {formatCurrency(r.balance, r.currency)}
                    </TableCell>
                    <TableCell className="num">{r.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">مصارف</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="table-scroll">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع مصرف</TableHead>
                  <TableHead>مبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseEntries.map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell>{expenseLabels[k] ?? k}</TableCell>
                    <TableCell className="num">{formatCurrency(v)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50 font-semibold">
                  <TableCell>جمع مصارف</TableCell>
                  <TableCell className="num">{formatCurrency(summary.expenses.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">سرمایه ابتدایی</p>
            <p className="mt-1 text-xl font-bold num">{formatCurrency(summary.openingCapital)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">مفاد / ضرر</p>
            <p className={`mt-1 text-xl font-bold num ${balanceClass(summary.profitLoss)}`}>
              {formatCurrency(summary.profitLoss)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">سرمایه نهایی</p>
            <p className="mt-1 text-xl font-bold num">{formatCurrency(summary.closingCapital)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
