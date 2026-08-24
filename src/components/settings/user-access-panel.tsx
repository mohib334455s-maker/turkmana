'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/lib/i18n/store';
import {
  buildUserAccessSummary,
  type UserAccessSummary,
} from '@/lib/role-access';
import type { UserRole } from '@/lib/auth-store';
import type { CompanyAccess } from '@/lib/company-access';
import { usePermissionsStore } from '@/lib/permissions';
import { cn } from '@/lib/utils';

function AccessBadges({
  summary,
  compact,
}: {
  summary: UserAccessSummary;
  compact?: boolean;
}) {
  const { tn, tx } = useI18n();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{summary.roleTitle}</Badge>
        <Badge variant="success">{summary.companyTitle}</Badge>
        {summary.canManageUsers ? (
          <Badge variant="warning">
            {tx('مدیریت کاربران', 'User management')}
          </Badge>
        ) : null}
        {summary.canViewProfitLoss ? (
          <Badge variant="default">
            {tx('مفاد و ضرر', 'Profit & loss')}
          </Badge>
        ) : (
          <Badge variant="muted">
            {tx('بدون مفاد و ضرر', 'No P&L')}
          </Badge>
        )}
      </div>
      <p className="text-xs leading-6 text-slate-500">{summary.companyDetail}</p>
      {!compact ? (
        <>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {tx('ماژول‌های اصلی', 'Main modules')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {summary.moduleKeys.map((key) => (
                <span
                  key={key}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700"
                >
                  {tn(key)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {tx('صفحات مجاز', 'Allowed pages')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {summary.pageKeys.map((key) => (
                <span
                  key={key}
                  className="rounded-lg border border-teal-100 bg-teal-50/80 px-2 py-1 text-[11px] font-medium text-teal-800"
                >
                  {tn(key)}
                </span>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function UserAccessCard({
  role,
  companyAccess,
  title,
  subtitle,
  className,
  compact,
}: {
  role: UserRole;
  companyAccess: CompanyAccess;
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}) {
  const { locale } = useI18n();
  const profitLossRoles = usePermissionsStore((s) => s.profitLossRoles);
  const summary = buildUserAccessSummary(role, companyAccess, locale, profitLossRoles);

  return (
    <Card className={cn('border-slate-200 shadow-none', className)}>
      <CardContent className="p-5">
        {title ? (
          <div className="mb-3">
            <p className="text-sm font-extrabold text-slate-900">{title}</p>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            ) : null}
          </div>
        ) : null}
        <AccessBadges summary={summary} compact={compact} />
      </CardContent>
    </Card>
  );
}

export function RoleAccessMatrix() {
  const { locale, tx, tn } = useI18n();
  const profitLossRoles = usePermissionsStore((s) => s.profitLossRoles);

  const rows = (
    [
      'admin',
      'manager',
      'accountant',
      'warehouse',
      'sales',
      'user',
    ] as UserRole[]
  ).map((role) =>
    buildUserAccessSummary(role, role === 'admin' ? 'both' : 'arya', locale, profitLossRoles)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-right">
              <th className="px-4 py-3 font-bold text-slate-700">
                {tx('نقش', 'Role')}
              </th>
              <th className="px-4 py-3 font-bold text-slate-700">
                {tx('شرکت (نمونه)', 'Company (sample)')}
              </th>
              <th className="px-4 py-3 font-bold text-slate-700">
                {tx('ماژول‌ها', 'Modules')}
              </th>
              <th className="px-4 py-3 font-bold text-slate-700">
                {tx('صلاحیت‌ها', 'Permissions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.role} className="border-b last:border-0">
                <td className="px-4 py-3 align-top font-semibold text-slate-900">
                  {row.roleTitle}
                </td>
                <td className="px-4 py-3 align-top text-xs text-slate-600">
                  {row.companyTitle}
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {row.moduleKeys.slice(0, 8).map((key) => (
                      <span
                        key={key}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
                      >
                        {tn(key)}
                      </span>
                    ))}
                    {row.moduleKeys.length > 8 ? (
                      <span className="text-[10px] text-slate-400">
                        +{row.moduleKeys.length - 8}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-xs text-slate-600">
                  <div className="space-y-1">
                    <div>
                      {row.canManageUsers
                        ? tx('✓ مدیریت کاربران', '✓ User management')
                        : tx('✗ بدون مدیریت کاربر', '✗ No user admin')}
                    </div>
                    <div>
                      {row.canViewProfitLoss
                        ? tx('✓ مفاد و ضرر', '✓ Profit & loss')
                        : tx('✗ بدون مفاد و ضرر', '✗ No P&L')}
                    </div>
                    <div className="text-slate-400">
                      {tx('صفحات', 'Pages')}: {row.pageKeys.length}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
