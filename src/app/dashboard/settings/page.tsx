'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, GitBranch, Globe2, Package, Save, Shield, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ModuleIcon } from '@/components/shared/module-icon';
import { PageHeader } from '@/components/shared/page-header';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { useCompanyStore, type CompanyFilter } from '@/lib/company-store';
import { canManageUsers, useAuthStore } from '@/lib/auth-store';

export default function SettingsPage() {
  const { t, tn, locale } = useI18n();
  const setLocale = useUiStore((s) => s.setLocale);
  const { company, setCompany } = useCompanyStore();
  const role = useAuthStore((s) => s.role);
  const [calendar, setCalendar] = useState(locale === 'fa' ? 'jalali' : 'gregorian');
  const [currency, setCurrency] = useState('USD');
  const [saved, setSaved] = useState(false);

  const cards = [
    { title: tn('companies'), href: '/dashboard/settings/companies', icon: Building2, desc: tn('settingsDesc') },
    { title: tn('branches'), href: '/dashboard/settings/branches', icon: GitBranch, desc: tn('branches') },
    { title: tn('products'), href: '/dashboard/settings/products', icon: Package, desc: tn('products') },
    { title: tn('users'), href: '/dashboard/settings/users', icon: Users, desc: tn('users') },
    { title: tn('roles'), href: '/dashboard/settings/roles', icon: Shield, desc: tn('roles') },
  ].filter((item) => canManageUsers(role) || (item.href !== '/dashboard/settings/users' && item.href !== '/dashboard/settings/roles'));

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={t('settingsGeneral')}
        description={t('settingsGeneralDesc')}
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Globe2 className="h-4 w-4 text-teal-600" />
            {t('settingsGeneral')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>{t('defaultLanguage')}</Label>
            <Select
              value={locale}
              onChange={(e) => setLocale(e.target.value as 'fa' | 'en')}
            >
              <option value="fa">{t('persian')}</option>
              <option value="en">{t('english')}</option>
            </Select>
          </div>
          <div>
            <Label>{t('defaultCompany')}</Label>
            <Select
              value={company}
              onChange={(e) => setCompany(e.target.value as CompanyFilter)}
            >
              <option value="arya">{t('companyArya')}</option>
              <option value="turkmen">{t('companyTurkmen')}</option>
              <option value="both">{t('companyBoth')}</option>
            </Select>
          </div>
          <div>
            <Label>{t('calendarType')}</Label>
            <Select value={calendar} onChange={(e) => setCalendar(e.target.value)}>
              <option value="jalali">{t('jalali')}</option>
              <option value="gregorian">{t('gregorian')}</option>
            </Select>
          </div>
          <div>
            <Label>{t('currencyBase')}</Label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="USD">USD</option>
              <option value="AED">AED</option>
              <option value="AFN">AFN</option>
              <option value="EUR">EUR</option>
            </Select>
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <Button
              onClick={() => {
                setSaved(true);
                window.setTimeout(() => setSaved(false), 2000);
              }}
            >
              <Save className="ms-2 h-4 w-4" />
              {t('saveSettings')}
            </Button>
            {saved ? (
              <span className="text-sm font-medium text-emerald-600">{t('settingsSaved')}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group block">
              <Card className="h-full border-slate-200 shadow-none">
                <CardContent className="flex items-start gap-3 p-4">
                  <ModuleIcon icon={Icon} moduleKey="settings" size="md" />
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">{item.desc}</p>
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
