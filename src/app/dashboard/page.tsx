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
import { ExchangeAccountsCard } from '@/components/dashboard/exchange-accounts-card';
import {
  MarketSpotCards,
  MarketSpotHeroPanel,
} from '@/components/dashboard/market-spot-cards';
import { KpiCardStack } from '@/components/dashboard/kpi-card-stack';
import { OpsModuleCard } from '@/components/dashboard/ops-module-card';
import { Card, CardContent } from '@/components/ui/card';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { useCompanyStore } from '@/lib/company-store';
import { financialSummary } from '@/lib/demo-data';
import { navModules } from '@/lib/navigation';
import { formatCurrency } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/store';
import { useAuthStore } from '@/lib/auth-store';
import { canViewProfitLoss, usePermissionsStore } from '@/lib/permissions';

const opsModules = navModules.filter((m) => m.key !== 'dashboard');

const monthBars: Array<{ name: string; purchase: number; sales: number }> = [];

export default function DashboardPage() {
  const { company } = useCompanyStore();
  const { t } = useI18n();
  const role = useAuthStore((s) => s.role);
  const profitLossRoles = usePermissionsStore((s) => s.profitLossRoles);
  const pnlOk = canViewProfitLoss(role, profitLossRoles);
  const fin = financialSummary[company];
  const companyLabel =
    company === 'turkmen' ? t('companyTurkmen') : t('companyArya');

  const kpiCards = [
    {
      title: t('kpiCustomers'),
      value: '0',
      change: '۰',
      up: true,
      icon: Users,
      accent: 'bg-gradient-to-br from-violet-600 via-violet-700 to-violet-950 border-violet-900/35',
      indicator: 'bg-violet-600',
    },
    {
      title: t('kpiInventory'),
      value: formatCurrency(fin.inventoryValue),
      change: '۰',
      up: true,
      icon: Warehouse,
      accent: 'bg-gradient-to-br from-teal-600 via-teal-700 to-teal-950 border-teal-900/35',
      indicator: 'bg-teal-600',
    },
    {
      title: t('colCashBalance'),
      value: formatCurrency(fin.customerBalance),
      change: '۰',
      up: true,
      icon: Handshake,
      accent: 'bg-gradient-to-br from-sky-600 via-sky-700 to-sky-950 border-sky-900/35',
      indicator: 'bg-sky-600',
    },
    {
      title: t('txnCount'),
      value: String(fin.txnCount),
      change: '۰',
      up: true,
      icon: Layers,
      accent: 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-950 border-amber-900/35',
      indicator: 'bg-amber-600',
    },
    ...(pnlOk
      ? [
          {
            title: t('pageProfitLoss'),
            value: formatCurrency(fin.profitLoss),
            change: '۰',
            up: true,
            icon: Scale,
            accent: 'bg-gradient-to-br from-rose-600 via-rose-700 to-rose-950 border-rose-900/35',
            indicator: 'bg-rose-600',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-10 animate-fade-in lg:space-y-12">
      <section>
        <div className="hidden overflow-hidden rounded-[28px] border border-emerald-100/80 bg-white lg:block">
          <div className="grid min-h-[400px] lg:grid-cols-2 xl:min-h-[420px]">
            <div className="flex min-h-[400px] flex-col px-8 py-8 xl:px-10">
              <div className="shrink-0">
                <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">
                  {t('executiveDashboard')} — {companyLabel}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                  {t('dashboardSubtitle')}
                </p>
                <div className="mt-5">
                  <CompanySwitcher />
                </div>
              </div>

              <div className="mt-6 flex min-h-0 flex-1 flex-col">
                <KpiCardStack items={kpiCards} variant="embedded" />
              </div>
            </div>

            <div className="relative min-h-[400px] overflow-hidden xl:min-h-[420px]">
              <MarketSpotHeroPanel />
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <KpiCardStack items={kpiCards} />
        </div>
      </section>

      <section>
        <MarketSpotCards />
      </section>

      <section>
        <ExchangeAccountsCard />
      </section>

      <section className="hidden lg:block">
        <div className="mb-5">
          <h2 className="text-lg font-extrabold text-slate-900">{t('enterModules')}</h2>
        </div>

        <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {opsModules.map((mod) => (
            <OpsModuleCard key={mod.key} mod={mod} />
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">{t('salesTrend')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('chartEmpty')}</p>
        </div>

        <Card className="rounded-2xl border-slate-200 shadow-none">
          <CardContent className="p-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-900">{t('salesTrend')}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-teal-500" /> {t('qaSale')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-slate-700" /> {t('qaPurchase')}
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
