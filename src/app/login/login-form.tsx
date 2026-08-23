'use client';

import { useState } from 'react';
import { Eye, EyeOff, Globe2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanyLogo } from '@/components/brand/company-logo';
import { LocaleEffects } from '@/components/layout/locale-effects';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { useAuthStore } from '@/lib/auth-store';

export function LoginForm() {
  const { t, locale, dir } = useI18n();
  const toggleLocale = useUiStore((s) => s.toggleLocale);
  const setSession = useAuthStore((s) => s.setSession);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: username, username, password }),
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
        <div className="flex items-center gap-4">
          <CompanyLogo company="turkmen" size="md" />
          <CompanyLogo company="arya" size="md" />
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
            <CompanyLogo company="turkmen" size="sm" />
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
                <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                  {t('username')}
                </label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
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
          </div>
        </div>
      </main>
    </div>
  );
}
