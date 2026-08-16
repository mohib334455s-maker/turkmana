'use client';

import { useState } from 'react';
import { Eye, EyeOff, Globe2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocaleEffects } from '@/components/layout/locale-effects';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { useAuthStore } from '@/lib/auth-store';

const DEMO_ACCOUNTS = [
  {
    id: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    labelKey: 'loginDemoAdmin' as const,
    companyKey: 'companyBoth' as const,
  },
  {
    id: 'arya',
    email: 'arya@example.com',
    password: 'arya123',
    labelKey: 'loginDemoArya' as const,
    companyKey: 'companyArya' as const,
  },
  {
    id: 'turkmen',
    email: 'turkmen@example.com',
    password: 'turkmen123',
    labelKey: 'loginDemoTurkmen' as const,
    companyKey: 'companyTurkmen' as const,
  },
] as const;

export function LoginForm({ demoAuth }: { demoAuth: boolean }) {
  const { t, locale, dir } = useI18n();
  const toggleLocale = useUiStore((s) => s.toggleLocale);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setSelectedDemo(account.id);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('loginError'));
        setLoading(false);
        return;
      }

      setSession({
        role: data.user?.role,
        email: data.user?.email,
        fullName: data.user?.fullName,
        companyAccess: data.user?.companyAccess,
      });
      window.location.assign('/dashboard');
    } catch {
      setError(t('serverError'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f3f6f8] lg:grid lg:grid-cols-2" dir={dir}>
      <LocaleEffects />

      <aside className="hidden bg-[#0f766e] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-lg font-bold">
            ت
          </div>
          <div>
            <p className="text-base font-bold">{t('appName')}</p>
            <p className="text-xs text-teal-100/80">{t('appTagline')}</p>
          </div>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-bold leading-snug">{t('loginTitle')}</h1>
          <p className="mt-3 text-sm leading-7 text-teal-50/85">{t('loginSubtitle')}</p>
          <p className="mt-8 text-sm text-teal-50/80">
            {t('companyArya')}
            <span className="mx-2 text-teal-100/40">|</span>
            {t('companyTurkmen')}
          </p>
        </div>

        <p className="text-xs text-teal-100/60">{t('loginBrandLine')}</p>
      </aside>

      <main className="flex min-h-[100dvh] flex-col">
        <header className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
          <div className="flex items-center gap-2.5 lg:invisible">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f766e] text-sm font-bold text-white">
              ت
            </div>
            <p className="text-sm font-bold text-slate-900">{t('appName')}</p>
          </div>
          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600"
          >
            <Globe2 className="h-3.5 w-3.5" />
            {locale === 'fa' ? 'EN' : 'FA'}
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[400px] rounded-xl border border-slate-200 bg-white p-6 sm:p-7">
            <h2 className="text-xl font-bold text-slate-900">{t('login')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('loginUseAccount')}</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  {t('email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedDemo(null);
                  }}
                  required
                  disabled={loading}
                  dir="ltr"
                  autoComplete="username"
                  className="h-11 rounded-lg text-left"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  {t('password')}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setSelectedDemo(null);
                    }}
                    required
                    disabled={loading}
                    dir="ltr"
                    autoComplete="current-password"
                    className="h-11 rounded-lg pe-11 text-left"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-400"
                    aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="h-11 w-full rounded-lg font-semibold" disabled={loading}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('loggingIn')}
                  </span>
                ) : (
                  t('login')
                )}
              </Button>
            </form>

            {demoAuth ? (
              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="mb-2 text-xs font-medium text-slate-500">{t('loginDemoTitle')}</p>
                <div className="space-y-2">
                  {DEMO_ACCOUNTS.map((account) => {
                    const active = selectedDemo === account.id;
                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => fillDemo(account)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-start ${
                          active
                            ? 'border-teal-400 bg-teal-50'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-medium text-slate-800">
                            {t(account.labelKey)}
                          </span>
                          <span className="block text-[11px] text-slate-500" dir="ltr">
                            {account.email}
                          </span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {t(account.companyKey)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
