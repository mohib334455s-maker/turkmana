'use client';

import {
  Handshake,
  Layers,
  Scale,
  Users,
  Warehouse,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { KpiCardStack } from '@/components/dashboard/kpi-card-stack';
import { OpsModuleCard } from '@/components/dashboard/ops-module-card';
import { Card, CardContent } from '@/components/ui/card';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { useCompanyStore, COMPANY_LABELS } from '@/lib/company-store';
import { financialSummary, products } from '@/lib/demo-data';
import { navModules } from '@/lib/navigation';
import { formatCurrency } from '@/lib/utils';

const opsModules = navModules.filter((m) => m.key !== 'dashboard');

const marketPrices: Array<{ code: string; name: string; buy: number; sell: number; unit: string }> = [];

const monthBars: Array<{ name: string; purchase: number; sales: number }> = [];

export default function DashboardPage() {
  const { company } = useCompanyStore();
  const fin = financialSummary[company];

  const kpiCards = [
    {
      title: 'مشتریان فعال',
      value: '0',
      change: '۰',
      up: true,
      icon: Users,
      accent: 'bg-gradient-to-br from-violet-600 via-violet-700 to-violet-950 border-violet-900/35',
      indicator: 'bg-violet-600',
    },
    {
      title: 'ارزش کل موجودی',
      value: formatCurrency(fin.inventoryValue),
      change: '۰',
      up: true,
      icon: Warehouse,
      accent: 'bg-gradient-to-br from-teal-600 via-teal-700 to-teal-950 border-teal-900/35',
      indicator: 'bg-teal-600',
    },
    {
      title: 'بیلانس مشتریان',
      value: formatCurrency(fin.customerBalance),
      change: '۰',
      up: true,
      icon: Handshake,
      accent: 'bg-gradient-to-br from-sky-600 via-sky-700 to-sky-950 border-sky-900/35',
      indicator: 'bg-sky-600',
    },
    {
      title: 'تعداد معاملات',
      value: String(fin.txnCount),
      change: '۰',
      up: true,
      icon: Layers,
      accent: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 border-amber-900/35',
      indicator: 'bg-amber-600',
    },
    {
      title: 'مفاد و ضرر',
      value: formatCurrency(fin.profitLoss),
      change: '۰',
      up: true,
      icon: Scale,
      accent: 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 border-rose-900/35',
      indicator: 'bg-rose-600',
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in lg:space-y-12">
      <section>
        <div className="hidden overflow-hidden rounded-[28px] border border-emerald-100/80 bg-white lg:block">
          <div className="grid min-h-[400px] lg:grid-cols-2 xl:min-h-[420px]">
            <div className="flex min-h-[400px] flex-col px-8 py-8 xl:px-10">
              <div className="shrink-0">
                <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
                  نمای اجرایی — {COMPANY_LABELS[company]}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                  وضعیت موجودی، بیلانس، معاملات و عملکرد دو شرکت در یک نگاه
                </p>
                <div className="mt-5">
                  <CompanySwitcher />
                </div>
              </div>

              <div className="mt-6 flex min-h-0 flex-1 flex-col">
                <KpiCardStack items={kpiCards} variant="embedded" />
              </div>
            </div>

            <div className="relative min-h-[400px] overflow-hidden bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#134e4a] xl:min-h-[420px]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
              <div className="absolute bottom-8 start-8 end-8 text-white">
                <p className="text-sm font-semibold text-teal-50/90">نمای اجرایی</p>
                <p className="mt-2 max-w-sm text-xs leading-6 text-teal-100/75">
                  موجودی، بیلانس، معاملات و عملکرد دو شرکت در یک نگاه
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <KpiCardStack items={kpiCards} />
        </div>
      </section>

      <section className="hidden lg:block">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-slate-900">صفحات عملیاتی</h2>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {opsModules.map((mod) => (
            <OpsModuleCard key={mod.key} mod={mod} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">قیمت خرید و فروش</h2>
          <p className="mt-1 text-sm text-slate-500">نرخ‌های جاری بازار و مقایسه هفتگی خرید / فروش</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {marketPrices
            .filter((p) => products.some((x) => x.code === p.code))
            .map((p) => (
              <Card
                key={p.code}
                className="rounded-2xl border-slate-200 shadow-none"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                      {p.unit}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-rose-50/70 px-2.5 py-2">
                      <p className="text-[10px] font-medium text-rose-500">خرید</p>
                      <p className="mt-0.5 text-sm font-bold text-rose-700 num">
                        {formatCurrency(p.buy)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50/70 px-2.5 py-2">
                      <p className="text-[10px] font-medium text-emerald-600">فروش</p>
                      <p className="mt-0.5 text-sm font-bold text-emerald-700 num">
                        {formatCurrency(p.sell)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-slate-400">
                    حاشیه:{' '}
                    <span className="font-semibold text-teal-700 num">
                      {formatCurrency(p.sell - p.buy)}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">خرید و فروش این ماه</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-teal-500" /> فروش
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-slate-700" /> خرید
                </span>
              </div>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthBars} barGap={4}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="purchase" fill="#334155" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
