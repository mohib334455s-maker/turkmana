'use client';

import Link from 'next/link';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Globe2,
  Menu,
  Search,
} from 'lucide-react';
import { CompanySwitcher } from '@/components/layout/company-switcher';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { dualDateLabel } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

const iconBtn =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700';

export function Header() {
  const { t, locale } = useI18n();
  const toggleLocale = useUiStore((s) => s.toggleLocale);
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav);
  const dates = dualDateLabel();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-3 py-2.5 sm:px-5 lg:px-7">
        <button
          type="button"
          onClick={toggleMobileNav}
          className={cn(iconBtn, 'lg:hidden')}
          aria-label="باز کردن منو"
        >
          <Menu className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>

        <div className="hidden min-w-0 flex-1 items-center lg:flex">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder={t('search')}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pe-16 ps-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
            <kbd className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 xl:inline">
              Ctrl K
            </kbd>
          </div>
        </div>

        <div className="ms-auto flex min-w-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 lg:flex">
            <CalendarDays className="h-3.5 w-3.5 text-teal-600" strokeWidth={1.75} />
            <span className="num text-xs font-semibold text-slate-800">{dates.jalali}</span>
            <span className="text-slate-300">|</span>
            <span className="num text-xs font-medium text-slate-500" dir="ltr">
              {dates.gregorian}
            </span>
          </div>

          <div className="hidden xl:block">
            <CompanySwitcher />
          </div>

          <button
            type="button"
            onClick={toggleLocale}
            className={cn(iconBtn, 'w-auto gap-1.5 px-3')}
            title={t('language')}
          >
            <Globe2 className="h-4 w-4" strokeWidth={1.75} />
            <span className="text-[11px] font-semibold">{locale === 'fa' ? 'EN' : 'FA'}</span>
          </button>

          <Link
            href="/dashboard/notifications"
            className={cn(iconBtn, 'relative')}
            title={t('notifications')}
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
            <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
          </Link>

          <div className="hidden items-center gap-2.5 rounded-2xl border border-slate-200 bg-white py-1 ps-1 pe-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-white">
              {locale === 'fa' ? 'م' : 'A'}
            </div>
            <div className="hidden leading-tight md:block">
              <p className="text-sm font-semibold text-slate-800">{t('systemManager')}</p>
              <p className="text-[11px] text-slate-400">{t('admin')}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 lg:block" />
          </div>
        </div>

        <div className="w-full lg:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder={t('search')}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pe-3 ps-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-50"
            />
          </div>
        </div>

        <div className="w-full xl:hidden">
          <CompanySwitcher className="w-full" />
        </div>
      </div>
    </header>
  );
}
