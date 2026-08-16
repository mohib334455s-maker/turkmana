'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, LayoutDashboard, MoreHorizontal, Users, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/lib/i18n/store';

const items = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/journal', label: 'عملیات', icon: Wallet },
  { href: '/dashboard/reports', label: 'گزارش', icon: BarChart3 },
  { href: '/dashboard/customers', label: 'مشتریان', icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur-md lg:hidden">
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium transition',
                active ? 'text-teal-600' : 'text-slate-400'
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl',
                  active ? 'bg-teal-50' : ''
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-medium text-slate-400"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl">
            <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          بیشتر
        </button>
      </div>
    </nav>
  );
}
