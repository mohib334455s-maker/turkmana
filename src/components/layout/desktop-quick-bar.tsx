'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  Package,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const addItems = [
  {
    title: 'مشتری جدید',
    hint: 'افزودن مشتری به دفتر حساب',
    href: '/dashboard/customers?new=1',
    icon: Users,
    tone: 'bg-violet-50 text-violet-600',
  },
  {
    title: 'محصول جدید',
    hint: 'ثبت کالا در تنظیمات محصولات',
    href: '/dashboard/settings/products?new=1',
    icon: Package,
    tone: 'bg-teal-50 text-teal-600',
  },
  {
    title: 'تأمین‌کننده جدید',
    hint: 'افزودن فروشنده خارجی',
    href: '/dashboard/suppliers?new=1',
    icon: Building2,
    tone: 'bg-orange-50 text-orange-600',
  },
];

export function DesktopQuickBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const onDashboard = pathname === '/dashboard' || pathname === '/dashboard/';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed bottom-6 left-6 z-40 hidden lg:block"
    >
      <div className="pointer-events-auto relative flex items-end gap-3">
        {open ? (
          <div className="absolute bottom-[4.25rem] start-0 w-72 origin-bottom-left animate-fade-in rounded-[24px] border border-emerald-100/80 bg-white/95 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <div className="mb-1 flex items-center justify-between px-3 pb-1 pt-2">
              <p className="text-xs font-bold text-slate-800">افزودن سریع</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                aria-label="بستن"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {addItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-right transition hover:bg-emerald-50/80"
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-2xl',
                        item.tone
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900">
                        {item.title}
                      </span>
                      <span className="block text-[11px] text-slate-500">
                        {item.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-full border border-emerald-200/70 bg-white/95 p-1.5 shadow-[0_14px_40px_rgba(16,185,129,0.22)] backdrop-blur-xl">
          <Link
            href="/dashboard"
            title="داشبورد"
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-full transition',
              onDashboard
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-300/50'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            )}
          >
            <LayoutDashboard className="h-5 w-5" strokeWidth={1.8} />
          </Link>

          <button
            type="button"
            title="افزودن"
            onClick={() => setOpen((v) => !v)}
            className={cn(
              'inline-flex h-12 w-12 items-center justify-center rounded-full transition',
              open
                ? 'bg-slate-900 text-white'
                : 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white shadow-md shadow-teal-300/50 hover:brightness-105'
            )}
          >
            {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" strokeWidth={2.2} />}
          </button>
        </div>
      </div>
    </div>
  );
}
