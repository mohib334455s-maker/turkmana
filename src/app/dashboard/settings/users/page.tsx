'use client';

import { Suspense } from 'react';
import { LocalizedCrud } from '@/components/shared/localized-crud';
import { UserAccessCard } from '@/components/settings/user-access-panel';
import { Card, CardContent } from '@/components/ui/card';
import { modules } from '@/lib/modules/catalog';
import { useI18n } from '@/lib/i18n/store';
import { asCompanyAccess, type CompanyAccess } from '@/lib/company-access';
import type { UserRole } from '@/lib/auth-store';

const demoUsers: Array<{
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  companyAccess: CompanyAccess;
}> = [
  {
    id: 1,
    email: 'turkman',
    fullName: 'System Admin',
    role: 'admin',
    companyAccess: 'both',
  },
  {
    id: 2,
    email: 'arya.manager',
    fullName: 'Arya Operations Manager',
    role: 'manager',
    companyAccess: 'arya',
  },
  {
    id: 3,
    email: 'turkmen.accountant',
    fullName: 'Turkmen Accountant',
    role: 'accountant',
    companyAccess: 'turkmen',
  },
  {
    id: 4,
    email: 'warehouse.ops',
    fullName: 'Warehouse Keeper',
    role: 'warehouse',
    companyAccess: 'turkmen',
  },
  {
    id: 5,
    email: 'sales.arya',
    fullName: 'Arya Sales',
    role: 'sales',
    companyAccess: 'arya',
  },
];

export default function UsersSettingsPage() {
  const { t, tx } = useI18n();

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <h2 className="text-base font-extrabold text-slate-900">{t('userAccessTitle')}</h2>
        <p className="mt-1 text-sm text-slate-500">{t('userAccessDesc')}</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {demoUsers.map((user) => (
            <UserAccessCard
              key={user.id}
              role={user.role}
              companyAccess={user.companyAccess}
              title={user.fullName}
              subtitle={`${user.email} · ${asCompanyAccess(user.companyAccess)}`}
            />
          ))}
        </div>
      </section>

      <Card className="border-slate-200 shadow-none">
        <CardContent className="p-5">
          <p className="text-sm font-bold text-slate-800">
            {tx('مدیریت حساب‌ها', 'Account management')}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {tx(
              'نقش و دسترسی شرکت هر کاربر را در فرم زیر تنظیم کنید.',
              'Set each user role and company access in the form below.'
            )}
          </p>
        </CardContent>
      </Card>

      <Suspense fallback={<div className="p-8 text-sm text-slate-500">{t('loading')}</div>}>
        <LocalizedCrud {...modules.users} />
      </Suspense>
    </div>
  );
}
