'use client';

import { Suspense, useMemo } from 'react';
import { LocalizedCrud } from '@/components/shared/localized-crud';
import { ActiveSessionsPanel } from '@/components/settings/active-sessions-panel';
import { Card, CardContent } from '@/components/ui/card';
import { modules } from '@/lib/modules/catalog';
import { useI18n } from '@/lib/i18n/store';
import { useAuthStore } from '@/lib/auth-store';
import { useCustomRolesStore } from '@/lib/custom-roles-store';
import { systemRoles } from '@/lib/roles';
import type { CrudModuleConfig } from '@/components/shared/crud-page';

export default function UsersSettingsPage() {
  const { t, tx } = useI18n();
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === 'admin';
  const customRoles = useCustomRolesStore((s) => s.roles);

  const usersModule = useMemo((): CrudModuleConfig => {
    const base = modules.users;
    const roleOptions = [
      { value: 'admin', label: 'مدیر سیستم|System admin' },
      ...systemRoles
        .filter((r) => r.key !== 'admin')
        .map((r) => ({ value: r.key, label: `${r.titleFa}|${r.titleEn}` })),
      ...customRoles.map((r) => ({ value: r.id, label: `${r.name}|${r.name}` })),
    ];

    return {
      ...base,
      fields: base.fields.map((f) =>
        f.key === 'role' ? { ...f, options: roleOptions } : f
      ),
    };
  }, [customRoles]);

  return (
    <div className="space-y-8 animate-fade-in">
      {isAdmin ? <ActiveSessionsPanel /> : null}

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-5">
          <p className="text-sm font-bold text-slate-800">
            {tx('مدیریت حساب‌ها', 'Account management')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {tx(
              'کاربر جدید بسازید، نقش سفارشی یا ادمین بدهید، و دسترسی شرکت را تنظیم کنید.',
              'Create users, assign custom or admin roles, and set company access.'
            )}
          </p>
        </CardContent>
      </Card>

      <Suspense fallback={<div className="p-8 text-sm text-slate-500">{t('loading')}</div>}>
        <LocalizedCrud {...usersModule} />
      </Suspense>
    </div>
  );
}
