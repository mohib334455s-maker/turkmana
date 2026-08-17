'use client';

import { Building2, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { ModuleIcon } from '@/components/shared/module-icon';
import { useI18n } from '@/lib/i18n/store';
import { systemRoles } from '@/lib/roles';
import { COMPANY_ACCESS_LABELS } from '@/lib/company-access';
import { canGrantProfitLoss, usePermissionsStore } from '@/lib/permissions';
import { useAuthStore, type UserRole } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';

const companyRules = [
  {
    key: 'arya',
    titleFa: 'ورود جدا به شرکت آریا',
    titleEn: 'Separate Arya login',
    bodyFa: 'کاربر فقط داده، گدام، قرارداد و حساب‌های آریا را می‌بیند. سوئیچ ترکمن برایش ظاهر نمی‌شود.',
    bodyEn: 'User only sees Arya data, warehouses, contracts and ledgers. Turkmen switch is hidden.',
  },
  {
    key: 'turkmen',
    titleFa: 'ورود جدا به شرکت ترکمن',
    titleEn: 'Separate Turkmen login',
    bodyFa: 'کاربر فقط داده و عملیات ترکمن را می‌بیند. سوئیچ آریا برایش ظاهر نمی‌شود.',
    bodyEn: 'User only sees Turkmen operations. Arya switch is hidden.',
  },
  {
    key: 'both',
    titleFa: 'هر دو شرکت — فقط با تأیید ادمین',
    titleEn: 'Both companies — admin grant only',
    bodyFa: 'ادمین می‌تواند برای یک کاربر دسترسی هر دو شرکت را باز کند. خود ادمین همیشه هر دو را دارد.',
    bodyEn: 'Only an admin can grant both-company access. The admin account always has both.',
  },
];

export default function RolesPage() {
  const { locale } = useI18n();
  const isFa = locale === 'fa';
  const role = useAuthStore((s) => s.role);
  const profitLossRoles = usePermissionsStore((s) => s.profitLossRoles);
  const toggleProfitLossRole = usePermissionsStore((s) => s.toggleProfitLossRole);
  const canGrant = canGrantProfitLoss(role);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isFa ? 'نقش‌ها و دسترسی شرکت' : 'Roles and company access'}
        description={
          isFa
            ? 'نقش سطح عملیات را مشخص می‌کند؛ دسترسی شرکت (آریا / ترکمن / هر دو) جدا از نقش است و فقط ادمین هر دو را می‌دهد'
            : 'Role defines operations; company access (Arya / Turkmen / both) is separate and only admin can grant both'
        }
        actions={
          <ExportButtons
            filename="roles"
            title={isFa ? 'نقش‌ها' : 'Roles'}
            columns={[
              { key: 'title', label: isFa ? 'نقش' : 'Role' },
              { key: 'access', label: isFa ? 'دسترسی' : 'Access' },
              { key: 'users', label: isFa ? 'کاربران' : 'Users' },
            ]}
            rows={systemRoles.map((r) => ({
              title: isFa ? r.titleFa : r.titleEn,
              access: isFa ? r.accessFa : r.accessEn,
              users: r.users,
            }))}
          />
        }
      />

      <Card className="border-amber-100">
        <CardContent className="space-y-3 p-5">
          <p className="text-[15px] font-extrabold text-slate-900">
            {isFa ? 'صلاحیت مفاد و ضرر' : 'Profit & loss access'}
          </p>
          <p className="text-xs leading-6 text-slate-500">
            {isFa
              ? 'بعضی نقش‌ها اصلاً نباید قسمت مفاد و ضرر را ببینند. فقط ادمین می‌تواند این صلاحیت را قید یا باز کند. انباردار و فروش به‌صورت پیش‌فرض بسته است.'
              : 'Some roles must not see profit & loss. Only an admin can grant or revoke this. Warehouse and sales are off by default.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {systemRoles.map((r) => {
              const on = r.key === 'admin' || profitLossRoles.includes(r.key as UserRole);
              return (
                <Button
                  key={r.key}
                  type="button"
                  size="sm"
                  variant={on ? 'default' : 'outline'}
                  disabled={!canGrant || r.key === 'admin'}
                  onClick={() => toggleProfitLossRole(r.key)}
                >
                  {isFa ? r.titleFa : r.titleEn}
                  {on ? ' ✓' : ''}
                </Button>
              );
            })}
          </div>
          {!canGrant ? (
            <p className="text-[11px] text-slate-400">
              {isFa ? 'فقط ادمین می‌تواند این تیک‌ها را عوض کند.' : 'Only an admin can change these ticks.'}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {companyRules.map((rule) => (
          <Card key={rule.key} className="border-teal-100">
            <CardContent className="p-5">
              <ModuleIcon icon={Building2} moduleKey="settings" size="md" />
              <p className="mt-3 text-[15px] font-extrabold text-slate-900">
                {isFa ? rule.titleFa : rule.titleEn}
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                {isFa ? rule.bodyFa : rule.bodyEn}
              </p>
              <p className="mt-3 text-[11px] text-slate-400">
                {COMPANY_ACCESS_LABELS[rule.key as keyof typeof COMPANY_ACCESS_LABELS].fa}
                {' / '}
                {COMPANY_ACCESS_LABELS[rule.key as keyof typeof COMPANY_ACCESS_LABELS].en}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {systemRoles.map((role) => (
          <Card key={role.key} className="border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <ModuleIcon icon={Shield} moduleKey="settings" size="md" />
                <Badge variant="muted">{role.users}</Badge>
              </div>
              <p className="mt-3 text-[15px] font-extrabold text-slate-900">
                {isFa ? role.titleFa : role.titleEn}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {isFa ? role.accessFa : role.accessEn}
              </p>
              <p className="mt-3 font-mono text-[11px] text-slate-400">{role.key}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
