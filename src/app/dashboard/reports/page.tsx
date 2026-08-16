'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ModuleIcon } from '@/components/shared/module-icon';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import {
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  Users,
  Warehouse,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { reportCardThemes } from '@/lib/route-module-meta';
import { useI18n } from '@/lib/i18n/store';

export default function ReportsPage() {
  const { tn } = useI18n();

  const reports: { title: string; href: string; icon: LucideIcon; desc: string }[] = [
    { title: tn('executive'), href: '/dashboard/reports/executive', icon: TrendingUp, desc: tn('reportsDesc') },
    { title: tn('aging'), href: '/dashboard/reports/aging', icon: Wallet, desc: tn('aging') },
    { title: tn('profitLoss'), href: '/dashboard/profit-loss', icon: FileSpreadsheet, desc: tn('profitLoss') },
    { title: tn('customers'), href: '/dashboard/customers/summary', icon: Users, desc: tn('customersSummary') },
    { title: tn('inventory'), href: '/dashboard/inventory', icon: Warehouse, desc: tn('inventory') },
    { title: tn('reportsCenter'), href: '/dashboard/reports', icon: BarChart3, desc: tn('reportsDesc') },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={tn('reportsCenter')}
        description={tn('reportsDesc')}
        actions={
          <ExportButtons
            filename="reports"
            title={tn('reportsCenter')}
            columns={[
              { key: 'title', label: 'گزارش' },
              { key: 'href', label: 'مسیر' },
              { key: 'desc', label: 'توضیح' },
            ]}
            rows={reports.map((r) => ({ title: r.title, href: r.href, desc: r.desc }))}
          />
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => {
          const navKey = reportCardThemes[r.href] ?? 'reports';
          return (
            <Link key={r.title + r.href} href={r.href} className="group block">
              <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="flex items-start gap-3 p-4">
                  <ModuleIcon icon={r.icon} moduleKey={navKey} size="md" className="transition group-hover:scale-105" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{r.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
