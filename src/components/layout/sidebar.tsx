'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { canManageUsers, useAuthStore } from '@/lib/auth-store';
import type { NavKey } from '@/lib/i18n/messages';
import {
  longestActiveChild,
  modulePrimaryHref,
  navModules,
  type NavModule,
} from '@/lib/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { t, tn, dir } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const navExpanded = useUiStore((s) => s.navExpanded);
  const toggleNavExpanded = useUiStore((s) => s.toggleNavExpanded);
  const setNavExpanded = useUiStore((s) => s.setNavExpanded);
  const [flyout, setFlyout] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const isRtl = dir === 'rtl';
  const role = useAuthStore((s) => s.role);
  const visibleModules = navModules.map((mod) => {
    if (mod.key !== 'settings' || canManageUsers(role)) return mod;
    return {
      ...mod,
      children: mod.children?.filter((c) => c.key !== 'users' && c.key !== 'roles'),
    };
  });

  useEffect(() => {
    navModules.forEach((mod) => {
      if (longestActiveChild(mod.children, pathname)) setNavExpanded(mod.key, true);
    });
  }, [pathname, setNavExpanded]);

  useEffect(() => {
    setMobileNavOpen(false);
    setFlyout(null);
  }, [pathname, setMobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  const closeMobile = () => setMobileNavOpen(false);

  const openFlyout = (key: string) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setFlyout(key);
  };

  const scheduleCloseFlyout = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setFlyout(null), 160);
  };

  return (
    <>
      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-30 bg-emerald-950/35 backdrop-blur-[2px] lg:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          'fixed top-0 z-40 flex h-[100dvh] flex-col border-emerald-900/10 bg-gradient-to-b from-[#0f766e] via-[#0d9488] to-[#047857] text-emerald-50 transition-transform duration-300 ease-out',
          isRtl ? 'right-0 border-l' : 'left-0 border-r',
          collapsed ? 'lg:w-[76px]' : 'w-[min(100vw-1.5rem,272px)] lg:w-[268px]',
          mobileNavOpen
            ? 'translate-x-0 shadow-2xl shadow-emerald-950/30'
            : isRtl
              ? 'translate-x-full lg:translate-x-0'
              : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-8 bottom-24 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />
        </div>

        <div
          className={cn(
            'relative flex h-16 shrink-0 items-center px-3',
            collapsed ? 'lg:justify-center' : 'justify-between gap-2'
          )}
        >
          <Link
            href="/dashboard"
            onClick={closeMobile}
            className="flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <ArrowLeftRight className="h-5 w-5" strokeWidth={1.75} />
            </div>
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{t('appName')}</p>
                <p className="truncate text-[11px] text-emerald-100/75">
                  v2.4.0 · {t('appTagline')}
                </p>
              </div>
            ) : null}
          </Link>
          <div className="flex items-center">
            <button
              type="button"
              onClick={closeMobile}
              className="rounded-xl p-2 text-emerald-100/80 hover:bg-white/10 lg:hidden"
              aria-label="بستن"
            >
              <X className="h-5 w-5" />
            </button>
            {!collapsed ? (
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden rounded-xl p-2 text-emerald-100/80 hover:bg-white/10 hover:text-white lg:inline-flex"
                title={t('collapseSidebar')}
              >
                {isRtl ? (
                  <PanelLeftOpen className="h-4 w-4" />
                ) : (
                  <PanelLeftClose className="h-4 w-4" />
                )}
              </button>
            ) : null}
          </div>
        </div>

        {collapsed ? (
          <div className="relative hidden justify-center py-1 lg:flex">
            <button
              type="button"
              onClick={toggleSidebar}
              className="rounded-xl p-2 text-emerald-100/80 hover:bg-white/10 hover:text-white"
              title={t('expandSidebar')}
            >
              {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        ) : null}

        <nav className="relative flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-1 overscroll-contain">
          <div className="space-y-0.5">
            {visibleModules.map((mod) => (
              <NavItem
                key={mod.key}
                mod={mod}
                pathname={pathname}
                collapsed={collapsed}
                isRtl={isRtl}
                navExpanded={navExpanded}
                flyout={flyout}
                tn={tn}
                closeMobile={closeMobile}
                toggleNavExpanded={toggleNavExpanded}
                openFlyout={openFlyout}
                scheduleCloseFlyout={scheduleCloseFlyout}
              />
            ))}
          </div>
        </nav>

        <div className="relative shrink-0 space-y-2 border-t border-white/10 p-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-2.5 py-2 ring-1 ring-white/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/85 text-xs font-bold text-emerald-800">
                م
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{t('systemManager')}</p>
                <p className="text-[11px] text-emerald-100/70">{t('admin')}</p>
              </div>
            </div>
          ) : null}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              title={t('logout')}
              className={cn(
                'flex items-center rounded-2xl text-emerald-50/85 transition hover:bg-rose-500/20 hover:text-white',
                collapsed
                  ? 'mx-auto h-11 w-11 justify-center'
                  : 'w-full gap-2.5 px-2.5 py-2 text-[13px] font-medium'
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.7} />
              {!collapsed ? <span>{t('logout')}</span> : null}
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  mod,
  pathname,
  collapsed,
  isRtl,
  navExpanded,
  flyout,
  tn,
  closeMobile,
  toggleNavExpanded,
  openFlyout,
  scheduleCloseFlyout,
}: {
  mod: NavModule;
  pathname: string;
  collapsed: boolean;
  isRtl: boolean;
  navExpanded: Record<string, boolean>;
  flyout: string | null;
  tn: (key: NavKey) => string;
  closeMobile: () => void;
  toggleNavExpanded: (key: string) => void;
  openFlyout: (key: string) => void;
  scheduleCloseFlyout: () => void;
}) {
  const Icon = mod.icon;
  const primary = modulePrimaryHref(mod);
  const hasChildren = !!mod.children?.length;
  const activeChild = longestActiveChild(mod.children, pathname);
  const selfActive = !!mod.href && pathname === mod.href;
  const pageActive = selfActive || !!activeChild;
  const isOpen = hasChildren ? (navExpanded[mod.key] ?? !!activeChild) : false;
  const showFlyout = collapsed && flyout === mod.key;
  const itemRef = useRef<HTMLDivElement>(null);
  const [flyPos, setFlyPos] = useState({ top: 0, inset: 84 });

  useLayoutEffect(() => {
    if (!showFlyout || !itemRef.current) return;
    const r = itemRef.current.getBoundingClientRect();
    const maxTop = Math.max(12, window.innerHeight - 320);
    setFlyPos({
      top: Math.min(r.top, maxTop),
      inset: isRtl ? window.innerWidth - r.left + 8 : r.right + 8,
    });
  }, [showFlyout, isRtl]);

  return (
    <div
      ref={itemRef}
      className="relative"
      onMouseEnter={() => {
        if (collapsed) openFlyout(mod.key);
      }}
      onMouseLeave={() => {
        if (collapsed) scheduleCloseFlyout();
      }}
    >
      <div
        className={cn(
          'group flex items-center rounded-2xl transition',
          collapsed ? 'lg:justify-center' : 'gap-0.5',
          selfActive
            ? 'bg-white/20 text-white'
            : 'text-emerald-50/90 hover:bg-white/10 hover:text-white'
        )}
      >
        {!collapsed && hasChildren ? (
          <button
            type="button"
            onClick={() => toggleNavExpanded(mod.key)}
            className="shrink-0 rounded-xl p-2 text-current/50 hover:text-current"
            aria-expanded={isOpen}
          >
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                isOpen ? 'rotate-0' : '-rotate-90'
              )}
            />
          </button>
        ) : null}

        {collapsed && hasChildren ? (
          <button
            type="button"
            title={tn(mod.key)}
            onClick={() => openFlyout(mod.key)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl transition',
              pageActive ? 'bg-white/20 text-white' : 'text-emerald-100/80 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
          </button>
        ) : (
          <Link
            href={primary}
            onClick={closeMobile}
            title={tn(mod.key)}
            className={cn(
              'flex flex-1 items-center py-2 transition',
              collapsed ? 'justify-center px-0 lg:mx-auto lg:h-11 lg:w-11' : 'gap-3 px-2.5',
              collapsed && pageActive && 'rounded-2xl bg-white/20'
            )}
          >
            <Icon
              className={cn(
                'h-[18px] w-[18px] shrink-0',
                selfActive || (collapsed && pageActive)
                  ? 'text-white'
                  : 'text-emerald-100/80 group-hover:text-white'
              )}
              strokeWidth={1.7}
            />
            {!collapsed ? (
              <span className="truncate text-[13px] font-semibold">{tn(mod.key)}</span>
            ) : null}
          </Link>
        )}
      </div>

      {showFlyout ? (
        <div
          className="fixed z-50 hidden w-60 rounded-2xl border border-white/10 bg-[#0f766e] p-2 shadow-2xl shadow-emerald-950/30 lg:block"
          style={
            isRtl
              ? { top: flyPos.top, right: flyPos.inset }
              : { top: flyPos.top, left: flyPos.inset }
          }
          onMouseEnter={() => openFlyout(mod.key)}
          onMouseLeave={scheduleCloseFlyout}
        >
          <p className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-100/70">
            {tn(mod.key)}
          </p>
          {hasChildren ? (
            mod.children!.map((child) => {
              const childActive = activeChild?.href === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={cn(
                    'block rounded-xl px-2.5 py-2 text-[13px] transition',
                    childActive
                      ? 'bg-white/20 font-semibold text-white'
                      : 'text-emerald-50/85 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {tn(child.key)}
                </Link>
              );
            })
          ) : (
            <Link
              href={primary}
              className={cn(
                'block rounded-xl px-2.5 py-2 text-[13px] transition',
                selfActive
                  ? 'bg-white/20 font-semibold text-white'
                  : 'text-emerald-50/85 hover:bg-white/10 hover:text-white'
              )}
            >
              {tn(mod.key)}
            </Link>
          )}
        </div>
      ) : null}

      {!collapsed && hasChildren && isOpen ? (
        <div className="mb-1 mt-0.5 space-y-0.5 ps-9">
          {mod.children!.map((child) => {
            const childActive = activeChild?.href === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={closeMobile}
                className={cn(
                  'block rounded-xl px-2.5 py-1.5 text-[12.5px] transition',
                  childActive
                    ? 'bg-white/20 font-semibold text-white'
                    : 'text-emerald-50/75 hover:bg-white/10 hover:text-white'
                )}
              >
                {tn(child.key)}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
