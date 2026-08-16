'use client';

import Link from 'next/link';
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
import { matchesCompany, useCompanyStore } from '@/lib/company-store';
import { exchangeHouses } from '@/lib/demo-data';
import { balanceClass, formatCurrency } from '@/lib/utils';

export default function ExchangePage() {
  const { company } = useCompanyStore();
  const rows = exchangeHouses.filter((e) => matchesCompany(e.company, company));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="صرافی‌ها"
        description="حساب هر صراف — تاریخ، نمبر حواله، طرف معامله، دریافتی، پرداختی، بیلانس، معادل ارزی و نرخ تبدیل"
        actions={
          <>
            <ExportButtons
              filename="exchange-houses"
              title="صرافی‌ها"
              columns={[
                { key: 'name', label: 'نام صراف' },
                { key: 'currency', label: 'ارز' },
                { key: 'totalIn', label: 'مجموع دریافت' },
                { key: 'totalOut', label: 'مجموع پرداخت' },
                { key: 'balance', label: 'مانده' },
                { key: 'fxPnl', label: 'سود/زیان نرخ' },
              ]}
              rows={rows}
            />
            <CompanySwitcher />
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              صرافی جدید
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        {rows.length === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="py-10 text-center text-sm text-slate-500">
              هنوز صرافی ثبت نشده است. پس از افزودن صراف، حساب و حواله‌ها اینجا دیده می‌شود.
            </CardContent>
          </Card>
        ) : null}
        {rows.map((house) => (
          <Card key={house.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{house.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{house.currency}</p>
                </div>
                <Badge variant="info">
                  {house.company === 'both'
                    ? 'هر دو'
                    : house.company === 'arya'
                      ? 'آریا'
                      : 'ترکمن'}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500">مجموع دریافت</p>
                  <p className="font-semibold num text-emerald-700">
                    {formatCurrency(house.totalIn)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">مجموع پرداخت</p>
                  <p className="font-semibold num text-red-600">
                    {formatCurrency(house.totalOut)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">مانده</p>
                  <p className={`font-semibold num ${balanceClass(house.balance)}`}>
                    {formatCurrency(house.balance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">سود/زیان نرخ</p>
                  <p className={`font-semibold num ${balanceClass(house.fxPnl)}`}>
                    {formatCurrency(house.fxPnl)}
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/exchange/${house.id}`}>
                <Button variant="outline" className="w-full mt-1" size="sm">
                  <Eye className="ml-2 h-4 w-4" />
                  مشاهده پروفایل
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="hidden overflow-hidden lg:block">
        <CardContent className="table-scroll p-0 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>صرافی</TableHead>
                <TableHead>ارز</TableHead>
                <TableHead>مجموع دریافت</TableHead>
                <TableHead>مجموع پرداخت</TableHead>
                <TableHead>مانده</TableHead>
                <TableHead>سود/زیان FX</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((house) => (
                <TableRow key={house.id}>
                  <TableCell className="font-medium">{house.name}</TableCell>
                  <TableCell>{house.currency}</TableCell>
                  <TableCell className="num text-emerald-700">
                    {formatCurrency(house.totalIn)}
                  </TableCell>
                  <TableCell className="num text-red-600">
                    {formatCurrency(house.totalOut)}
                  </TableCell>
                  <TableCell className={`num ${balanceClass(house.balance)}`}>
                    {formatCurrency(house.balance)}
                  </TableCell>
                  <TableCell className={`num ${balanceClass(house.fxPnl)}`}>
                    {formatCurrency(house.fxPnl)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/exchange/${house.id}`}>
                      <Button size="sm" variant="ghost">
                        جزئیات
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
