'use client';

import { useState } from 'react';
import { ArrowLeftRight, Eye, EyeOff, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocaleEffects } from '@/components/layout/locale-effects';
import { useI18n, useUiStore } from '@/lib/i18n/store';
import { useAuthStore } from '@/lib/auth-store';

export function LoginForm({ demoAuth }: { demoAuth: boolean }) {
  const { t, locale, dir } = useI18n();
  const toggleLocale = useUiStore((s) => s.toggleLocale);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillDemo = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
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
    <div className="min-h-[100dvh] bg-[#f3f6f8]" dir={dir}>
      <LocaleEffects />
      <button
        type="button"
        onClick={toggleLocale}
        className="fixed end-4 top-[max(1rem,env(safe-area-inset-top))] z-10 inline-flex h-10 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600"
      >
        <Globe2 className="h-4 w-4" />
        {locale === 'fa' ? 'EN' : 'FA'}
      </button>

      <div className="mx-auto grid min-h-[100dvh] max-w-6xl lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#134e4a] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            <h1 className="mt-10 text-3xl font-bold tracking-tight">{t('appName')}</h1>
            <p className="mt-3 max-w-sm text-sm leading-7 text-teal-50/90">{t('loginSubtitle')}</p>
          </div>
          <div className="space-y-3 text-sm text-teal-50/85">
            <p>قرارداد، وارده، گدام و مالی در یک هسته عملیاتی</p>
            <p className="text-xs text-teal-100/60">{t('loginTitle')}</p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <h1 className="mt-5 text-xl font-bold text-slate-900">{t('appName')}</h1>
              <p className="mt-1 text-sm text-slate-500">{t('loginSubtitle')}</p>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-7">
              <h2 className="text-lg font-bold text-slate-900">{t('login')}</h2>
              <p className="mt-1 text-sm text-slate-500">{t('loginTitle')}</p>
              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                {error ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    dir="ltr"
                    autoComplete="username"
                    className="h-11 rounded-2xl text-left"
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
                      className="h-11 rounded-2xl pe-11 text-left"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-400"
                      aria-label={showPassword ? 'hide' : 'show'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="mt-2 h-11 w-full rounded-2xl" disabled={loading}>
                  {loading ? t('loggingIn') : t('login')}
                </Button>
                {demoAuth ? (
                  <button
                    type="button"
                    onClick={fillDemo}
                    className="w-full text-center text-xs font-medium text-teal-700 hover:underline"
                  >
                    {t('demoLoginHint')}
                  </button>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
