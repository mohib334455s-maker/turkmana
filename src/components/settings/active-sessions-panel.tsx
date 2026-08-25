'use client';

import { useCallback, useEffect, useState } from 'react';
import { Monitor, Smartphone, Wifi, Database, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';

type PresenceSession = {
  sessionId: string;
  userId: number;
  email: string;
  fullName: string;
  role: string;
  ip: string;
  userAgent: string;
  isMobile: boolean;
  loginAt: string;
  lastSeenAt: string;
};

export function ActiveSessionsPanel() {
  const { tx, locale } = useI18n();
  const [sessions, setSessions] = useState<PresenceSession[]>([]);
  const [usingDatabase, setUsingDatabase] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/presence', { credentials: 'include', cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as {
        sessions?: PresenceSession[];
        usingDatabase?: boolean;
      };
      setSessions(data.sessions ?? []);
      setUsingDatabase(Boolean(data.usingDatabase));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(load, 20_000);
    return () => window.clearInterval(id);
  }, [load]);

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(locale === 'fa' ? 'fa-AF' : 'en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <Card className="overflow-hidden rounded-[24px] border-teal-200 shadow-none">
      <div className="border-b border-teal-100 bg-gradient-to-r from-teal-50/90 to-emerald-50/50 px-6 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {tx('کاربران آنلاین', 'Online users')}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {tx(
                'چه کسی الان در سیستم است و از کدام IP / دستگاه',
                'Who is active now and from which IP / device'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={usingDatabase ? 'success' : 'warning'}>
              <Database className="ms-1 h-3 w-3" />
              {usingDatabase
                ? tx('دیتابیس فعال', 'Database active')
                : tx('حالت دمو', 'Demo mode')}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={cn('ms-2 h-4 w-4', loading && 'animate-spin')} />
              {tx('به‌روز', 'Refresh')}
            </Button>
          </div>
        </div>
      </div>
      <CardContent className="p-0">
        <div className="grid gap-0 sm:grid-cols-3 sm:divide-x sm:divide-slate-100 rtl:sm:divide-x-reverse">
          <div className="border-b border-slate-100 p-5 sm:border-b-0">
            <p className="text-xs font-medium text-slate-500">{tx('آنلاین', 'Online now')}</p>
            <p className="mt-2 text-3xl font-extrabold num text-teal-700">{sessions.length}</p>
          </div>
          <div className="border-b border-slate-100 p-5 sm:border-b-0">
            <p className="text-xs font-medium text-slate-500">{tx('موبایل', 'Mobile')}</p>
            <p className="mt-2 text-3xl font-extrabold num text-amber-700">
              {sessions.filter((s) => s.isMobile).length}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-slate-500">{tx('شبکه شرکت', 'Company LAN')}</p>
            <p className="mt-2 text-3xl font-extrabold num text-sky-700">
              {
                sessions.filter(
                  (s) =>
                    s.ip.startsWith('192.168.') ||
                    s.ip.startsWith('10.') ||
                    s.ip.startsWith('172.') ||
                    s.ip === '127.0.0.1'
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-center">
                <th className="px-4 py-3 font-bold text-slate-700">{tx('کاربر', 'User')}</th>
                <th className="px-4 py-3 font-bold text-slate-700">{tx('نقش', 'Role')}</th>
                <th className="px-4 py-3 font-bold text-slate-700">IP</th>
                <th className="px-4 py-3 font-bold text-slate-700">{tx('دستگاه', 'Device')}</th>
                <th className="px-4 py-3 font-bold text-slate-700">{tx('آخرین فعالیت', 'Last seen')}</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    {loading
                      ? tx('در حال بارگذاری…', 'Loading…')
                      : tx('فعلاً کاربر آنلاینی نیست', 'No online users right now')}
                  </td>
                </tr>
              ) : (
                sessions.map((s) => (
                  <tr key={s.sessionId} className="border-b last:border-0">
                    <td className="px-4 py-3 text-center">
                      <p className="font-semibold text-slate-900">{s.fullName || s.email}</p>
                      <p className="text-[11px] text-slate-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="info">{s.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center num text-xs">{s.ip}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 text-xs">
                        {s.isMobile ? (
                          <>
                            <Smartphone className="h-3.5 w-3.5 text-amber-600" />
                            {tx('موبایل', 'Mobile')}
                          </>
                        ) : (
                          <>
                            <Monitor className="h-3.5 w-3.5 text-sky-600" />
                            {tx('دسکتاپ', 'Desktop')}
                          </>
                        )}
                        <Wifi className="ms-1 h-3 w-3 text-slate-400" />
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center num text-xs text-slate-600">
                      {formatTime(s.lastSeenAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
