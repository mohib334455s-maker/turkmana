'use client';

import { Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { ExportButtons } from '@/components/shared/export-buttons';
import { ModuleIcon } from '@/components/shared/module-icon';
import {
  RoleAccessMatrix,
  UserAccessCard,
} from '@/components/settings/user-access-panel';
import { useI18n } from '@/lib/i18n/store';
import { systemRoles } from '@/lib/roles';
import { COMPANY_ACCESS_LABELS } from '@/lib/company-access';
import { canGrantProfitLoss, usePermissionsStore } from '@/lib/permissions';
import { useAuthStore, type UserRole } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import type { CompanyAccess } from '@/lib/company-access';

const companyRules: Array<{
  key: CompanyAccess;
  titleFa: string;
  titleEn: string;
  bodyFa: string;
  bodyEn: string;
}> = [
  {
    key: 'arya',
    titleFa: 'فقط آزیا آریا لمتید',
    titleEn: 'Azya Aria Ltd only',
    bodyFa: 'کاربر فقط داده، گدام، قرارداد و حساب‌های آریا را می‌بیند. سوئیچ ترکمن برایش ظاهر نمی‌شود.',
    bodyEn: 'User only sees Arya data, warehouses, contracts and ledgers. Turkmen switch is hidden.',
  },
  {
    key: 'turkmen',
    titleFa: 'فقط ترکمن',
    titleEn: 'Turkmen only',
    bodyFa: 'کاربر فقط داده و عملیات ترکمن را می‌بیند. سوئیچ آریا برایش ظاهر نمی‌شود.',
    bodyEn: 'User only sees Turkmen operations. Arya switch is hidden.',
  },
  {
    key: 'both',
    titleFa: 'آریا و ترکمن (سوئیچ)',
    titleEn: 'Arya & Turkmen (switch)',
    bodyFa: 'ادمین می‌تواند برای یک کاربر امکان جابه‌جایی بین دو شرکت را بدهد. هر بار فقط یک شرکت فعال است.',
    bodyEn: 'Admin can grant switching between both companies. One active company at a time.',
  },
];

export default function RolesPage() {
  const { locale, t, tx } = useI18n();
  const isFa = locale === 'fa';
  const role = useAuthStore((s) => s.role);
  const profitLossRoles = usePermissionsStore((s) => s.profitLossRoles);
  const toggleProfitLossRole = usePermissionsStore((s) => s.toggleProfitLossRole);
  const canGrant = canGrantProfitLoss(role);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={isFa ? 'نقش‌ها و دسترسی' : 'Roles & access'}
        description={
          isFa
            ? 'برای هر نقش: شرکت مجاز، ماژول‌ها، صفحات و صلاحیت‌های خاص (مثل مفاد و ضرر)'
            : 'Per role: allowed company, modules, pages and special permissions (e.g. P&L)'
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

      <section>
        <h2 className="text-base font-extrabold text-slate-900">{t('accessMatrixTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('accessMatrixDesc')}</p>
        <div className="mt-4">
          <RoleAccessMatrix />
        </div>
      </section>

      <Card className="border-amber-100">
        <CardContent className="space-y-3 p-5">
          <p className="text-[15px] font-extrabold text-slate-900">
            {isFa ? 'صلاحیت مفاد و ضرر' : 'Profit & loss access'}
          </p>
          <p className="text-xs leading-6 text-slate-500">
            {isFa
              ? 'بعضی نقش‌ها اصلاً نباید قسمت مفاد و ضرر را ببینند. فقط ادمین می‌تواند این صلاحیت را قید یا باز کند.'
              : 'Some roles must not see profit & loss. Only an admin can grant or revoke this.'}
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
                {COMPANY_ACCESS_LABELS[rule.key].fa}
                {' / '}
                {COMPANY_ACCESS_LABELS[rule.key].en}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h2 className="text-base font-extrabold text-slate-900">
          {tx('جزئیات کامل هر نقش', 'Full detail per role')}
        </h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {systemRoles.map((roleDef) => {
            const sampleCompany: CompanyAccess =
              roleDef.key === 'admin' ? 'both' : 'arya';
            return (
              <UserAccessCard
                key={roleDef.key}
                role={roleDef.key}
                companyAccess={sampleCompany}
                title={isFa ? roleDef.titleFa : roleDef.titleEn}
                subtitle={isFa ? roleDef.accessFa : roleDef.accessEn}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
