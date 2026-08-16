'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { DesktopQuickBar } from '@/components/layout/desktop-quick-bar';
import { LocaleEffects } from '@/components/layout/locale-effects';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { useAuthStore } from '@/lib/auth-store';
import { useCompanyStore } from '@/lib/company-store';
import { clampCompany } from '@/lib/company-access';
import { cn } from '@/lib/utils';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { dir } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setSession = useAuthStore((s) => s.setSession);
  const companyAccess = useAuthStore((s) => s.companyAccess);
  const { company, setCompany } = useCompanyStore();
  const isRtl = dir === 'rtl';

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setSession(data.user);
      })
      .catch(() => undefined);
  }, [setSession]);

  useEffect(() => {
    const next = clampCompany(company, companyAccess);
    if (next !== company) setCompany(next);
  }, [company, companyAccess, setCompany]);

  return (
    <div className="min-h-[100dvh] bg-[var(--surface)]" dir={dir}>
      <LocaleEffects />
      <Sidebar />
      <div
        className={cn(
          'min-w-0 transition-all duration-300',
          isRtl
            ? collapsed
              ? 'lg:mr-[76px]'
              : 'lg:mr-[268px]'
            : collapsed
              ? 'lg:ml-[76px]'
              : 'lg:ml-[268px]'
        )}
      >
        <Header />
        <main className="page-main px-3 pb-[max(5.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-5 lg:px-7 lg:pb-10">
          {children}
        </main>
      </div>
      <DesktopQuickBar />
      <MobileNav />
    </div>
  );
}
