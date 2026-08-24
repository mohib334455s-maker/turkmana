'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Database,
  Download,
  GitBranch,
  Globe2,
  HardDrive,
  Info,
  Package,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  Upload,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/shared/page-header';
import {
  clearOperationalData,
  countStoredKeys,
  downloadBackup,
  estimateBackupSizeKb,
  restoreBackup,
} from '@/lib/backup';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { useCompanyStore, type CompanyFilter } from '@/lib/company-store';
import { UserAccessCard } from '@/components/settings/user-access-panel';
import { canManageUsers, useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

type ModuleCard = {
  title: string;
  href: string;
  icon: typeof Building2;
  desc: string;
  tone: string;
  adminOnly?: boolean;
};

export default function SettingsPage() {
  const { t, tn, dir } = useI18n();
  const locale = useUiStore((s) => s.locale);
  const calendarType = useUiStore((s) => s.calendarType);
  const baseCurrency = useUiStore((s) => s.baseCurrency);
  const setLocale = useUiStore((s) => s.setLocale);
  const setCalendarType = useUiStore((s) => s.setCalendarType);
  const setBaseCurrency = useUiStore((s) => s.setBaseCurrency);
  const { company, setCompany } = useCompanyStore();
  const role = useAuthStore((s) => s.role);
  const companyAccess = useAuthStore((s) => s.companyAccess);
  const isAdmin = role === 'admin';
  const canManage = canManageUsers(role);

  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastBackup, setLastBackup] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('erp-last-backup-at');
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const Arrow = dir === 'rtl' ? ArrowLeft : ArrowRight;

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const moduleCards: ModuleCard[] = [
    {
      title: tn('companies'),
      href: '/dashboard/settings/companies',
      icon: Building2,
      desc: t('settingsModulesDesc'),
      tone: 'from-violet-500/10 to-violet-600/5 border-violet-100 hover:border-violet-200',
    },
    {
      title: tn('branches'),
      href: '/dashboard/settings/branches',
      icon: GitBranch,
      desc: tn('branches'),
      tone: 'from-teal-500/10 to-teal-600/5 border-teal-100 hover:border-teal-200',
    },
    {
      title: tn('products'),
      href: '/dashboard/settings/products',
      icon: Package,
      desc: tn('products'),
      tone: 'from-amber-500/10 to-amber-600/5 border-amber-100 hover:border-amber-200',
    },
    {
      title: tn('users'),
      href: '/dashboard/settings/users',
      icon: Users,
      desc: tn('users'),
      tone: 'from-sky-500/10 to-sky-600/5 border-sky-100 hover:border-sky-200',
      adminOnly: true,
    },
    {
      title: tn('roles'),
      href: '/dashboard/settings/roles',
      icon: Shield,
      desc: tn('roles'),
      tone: 'from-rose-500/10 to-rose-600/5 border-rose-100 hover:border-rose-200',
      adminOnly: true,
    },
  ].filter((item) => !item.adminOnly || canManage);

  const storageKb = estimateBackupSizeKb();
  const storedKeys = countStoredKeys();

  const handleExport = () => {
    const at = downloadBackup();
    localStorage.setItem('erp-last-backup-at', at);
    setLastBackup(at);
    showToast(t('backupSuccess'));
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = restoreBackup(String(reader.result ?? ''));
      if (!result.ok) {
        showToast(t('backupRestoreError'));
        return;
      }
      showToast(t('backupRestoreSuccess'));
      window.setTimeout(() => window.location.reload(), 1200);
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (!window.confirm(t('backupClearConfirm'))) return;
    clearOperationalData();
    showToast(t('backupClearSuccess'));
    window.setTimeout(() => window.location.reload(), 1200);
  };

  const formatBackupDate = (iso: string | null) => {
    if (!iso) return t('never');
    try {
      return new Date(iso).toLocaleString(locale === 'fa' ? 'fa-IR' : 'en-US');
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <PageHeader title={t('settingsGeneral')} description={t('settingsGeneralDesc')} />

      {toast ? (
        <div className="fixed bottom-24 start-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {toast}
        </div>
      ) : null}

      <UserAccessCard
        role={role}
        companyAccess={companyAccess}
        title={t('yourAccessTitle')}
        className="border-teal-100 bg-gradient-to-r from-teal-50/50 to-white"
      />

      {/* General preferences */}
      <Card className="overflow-hidden rounded-[24px] border-slate-200/80 shadow-none">
        <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50/80 to-emerald-50/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{t('settingsGeneral')}</h2>
              <p className="text-xs text-slate-500">{t('settingsGeneralDesc')}</p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
          <div>
            <Label>{t('defaultLanguage')}</Label>
            <Select value={locale} onChange={(e) => setLocale(e.target.value as 'fa' | 'en')}>
              <option value="fa">{t('persian')}</option>
              <option value="en">{t('english')}</option>
            </Select>
            <p className="mt-1.5 text-[11px] text-slate-400">{t('languageHint')}</p>
          </div>
          <div>
            <Label>{t('defaultCompany')}</Label>
            <Select
              value={company}
              onChange={(e) => setCompany(e.target.value as CompanyFilter)}
            >
              <option value="arya">{t('companyArya')}</option>
              <option value="turkmen">{t('companyTurkmen')}</option>
            </Select>
            <p className="mt-1.5 text-[11px] text-slate-400">{t('companyHint')}</p>
          </div>
          <div>
            <Label>{t('calendarType')}</Label>
            <Select
              value={calendarType}
              onChange={(e) => setCalendarType(e.target.value as 'jalali' | 'gregorian')}
            >
              <option value="jalali">{t('jalali')}</option>
              <option value="gregorian">{t('gregorian')}</option>
            </Select>
            <p className="mt-1.5 text-[11px] text-slate-400">{t('calendarHint')}</p>
          </div>
          <div>
            <Label>{t('currencyBase')}</Label>
            <Select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)}>
              <option value="USD">USD — US Dollar</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="AFN">AFN — Afghan Afghani</option>
              <option value="EUR">EUR — Euro</option>
            </Select>
            <p className="mt-1.5 text-[11px] text-slate-400">{t('currencyHint')}</p>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
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

      {/* Module management */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-extrabold text-slate-900">{t('settingsModules')}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{t('settingsModulesDesc')}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {moduleCards.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="group block">
                <Card
                  className={cn(
                    'h-full rounded-2xl border bg-gradient-to-br shadow-none transition hover:-translate-y-0.5 hover:shadow-md',
                    item.tone
                  )}
                >
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon className="h-5 w-5 text-slate-700" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                        <Arrow className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-teal-600" />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Data & backup */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-extrabold text-slate-900">{t('settingsData')}</h2>
          <p className="mt-0.5 text-sm text-slate-500">{t('settingsDataDesc')}</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-2xl border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Download className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-slate-900">{t('backupExport')}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{t('backupExportHint')}</p>
              <Button className="mt-4 w-full" variant="outline" onClick={handleExport}>
                <Download className="ms-2 h-4 w-4" />
                {t('backupExport')}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Upload className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-slate-900">{t('backupImport')}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{t('backupImportHint')}</p>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = '';
                }}
              />
              <Button
                className="mt-4 w-full"
                variant="outline"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="ms-2 h-4 w-4" />
                {t('backupImport')}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-rose-100 shadow-none">
            <CardContent className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-extrabold text-slate-900">{t('backupClear')}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">{t('backupClearHint')}</p>
              <Button
                className="mt-4 w-full border-rose-200 text-rose-700 hover:bg-rose-50"
                variant="outline"
                onClick={handleClear}
                disabled={!isAdmin}
              >
                <RefreshCw className="ms-2 h-4 w-4" />
                {t('backupClear')}
              </Button>
              {!isAdmin ? (
                <p className="mt-2 text-[11px] text-slate-400">{t('adminOnly')}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* System info */}
      <Card className="rounded-[24px] border-slate-200/80 shadow-none">
        <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200/60 text-slate-600">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{t('settingsSystem')}</h2>
              <p className="text-xs text-slate-500">{t('settingsSystemDesc')}</p>
            </div>
          </div>
        </div>
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <HardDrive className="h-4 w-4" />
              <span className="text-xs font-medium">{t('systemStorage')}</span>
            </div>
            <p className="mt-2 text-lg font-extrabold num text-slate-900">
              {storageKb} KB
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Database className="h-4 w-4" />
              <span className="text-xs font-medium">{t('systemKeys')}</span>
            </div>
            <p className="mt-2 text-lg font-extrabold num text-slate-900">{storedKeys} / 4</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Download className="h-4 w-4" />
              <span className="text-xs font-medium">{t('lastBackup')}</span>
            </div>
            <p className="mt-2 text-sm font-bold text-slate-900">{formatBackupDate(lastBackup)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
