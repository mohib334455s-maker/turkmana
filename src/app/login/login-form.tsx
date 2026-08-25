'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    const reason = searchParams.get('reason');
    if (reason === 'mobile_blocked') {
      return locale === 'fa'
        ? 'این نقش اجازه ورود از موبایل را ندارد'
        : 'This role cannot log in from mobile';
    }
    if (reason === 'network_blocked') {
      return locale === 'fa'
        ? 'این نقش فقط از شبکه داخلی شرکت قابل استفاده است'
        : 'This role is limited to the company network';
    }
    return '';
  });

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
    <div
      className="relative flex min-h-[100dvh] flex-col bg-[#f7fafb]"
      dir={dir}
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(15,118,110,0.08), transparent), linear-gradient(180deg, #ffffff 0%, #f3f7f8 100%)',
      }}
    >
      <LocaleEffects />

      <header className="flex items-center justify-end px-5 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8">
        <button
          type="button"
          onClick={toggleLocale}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 shadow-sm"
        >
          <Globe2 className="h-3.5 w-3.5" />
          {locale === 'fa' ? 'EN' : 'FA'}
        </button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-8 sm:px-8">
        <div className="mb-8 flex w-full max-w-[440px] flex-col items-center text-center">
          <div className="flex items-end justify-center gap-6 sm:gap-8">
            <CompanyLogo company="turkmen" size="xl" className="login-logo" />
            <CompanyLogo company="arya" size="xl" className="login-logo" />
          </div>
          <p className="mt-5 text-lg font-extrabold tracking-tight text-slate-900">{t('appName')}</p>
          <p className="mt-1 text-sm text-slate-500">{t('appTagline')}</p>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            {t('companyArya')}
            <span className="mx-2 text-slate-300">·</span>
            {t('companyTurkmen')}
          </p>
        </div>

        <div className="w-full max-w-[400px] rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)] sm:p-8">
          <h1 className="text-center text-xl font-bold text-slate-900">{t('login')}</h1>
          <p className="mt-1 text-center text-sm text-slate-500">{t('loginUseAccount')}</p>

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

        <p className="mt-8 max-w-sm text-center text-xs leading-5 text-slate-400">
          {t('loginBrandLine')}
        </p>
      </main>
    </div>
  );
}
