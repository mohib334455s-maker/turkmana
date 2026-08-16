'use client';

import { useState } from 'react';
import {
  Building2,
  Eye,
  EyeOff,
  Globe2,
  Landmark,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Truck,
} from 'lucide-react';
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

function TradeArt() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 720 900"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="loginRoute" x1="80" y1="160" x2="640" y2="720" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f5d78a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5eead4" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M90 210C180 150 250 280 340 240C430 200 470 120 560 170C620 204 640 290 590 360"
        stroke="url(#loginRoute)"
        strokeWidth="1.4"
        strokeDasharray="5 9"
      />
      <path
        d="M70 520C160 470 230 610 340 560C450 510 500 640 610 590"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.2"
        strokeDasharray="4 10"
      />
      <path
        d="M120 740C220 680 300 780 410 720C520 660 580 780 680 720"
        stroke="rgba(245,215,138,0.28)"
        strokeWidth="1.1"
      />
      <circle cx="340" cy="240" r="5" fill="#f5d78a" />
      <circle cx="340" cy="240" r="12" stroke="#f5d78a" strokeOpacity="0.35" />
      <circle cx="590" cy="360" r="4" fill="#99f6e4" />
      <circle cx="340" cy="560" r="4" fill="#f5d78a" />
      <circle cx="610" cy="590" r="3.5" fill="#99f6e4" />
    </svg>
  );
}

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
    <div className="min-h-[100dvh] bg-[#061311] lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(380px,0.88fr)]" dir={dir}>
      <LocaleEffects />

      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b3d38] via-[#0f766e] to-[#052e2b] lg:flex lg:flex-col lg:justify-between">
        <div className="login-glow pointer-events-none absolute -start-24 top-10 h-[28rem] w-[28rem] rounded-full bg-[#f5d78a]/15 blur-3xl" />
        <div className="pointer-events-none absolute -end-20 bottom-0 h-[26rem] w-[26rem] rounded-full bg-teal-300/10 blur-3xl" />
        <TradeArt />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.12),transparent_36%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between px-12 py-10 xl:px-16">
          <div className="flex items-center gap-3 text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5d78a] text-lg font-extrabold text-[#14332f] shadow-[0_8px_24px_rgba(245,215,138,0.28)]">
              ت
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight">{t('appName')}</p>
              <p className="text-xs text-teal-100/70">{t('appTagline')}</p>
            </div>
          </div>

          <div className="login-rise max-w-xl">
            <p className="inline-flex items-center rounded-full border border-[#f5d78a]/30 bg-[#f5d78a]/10 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-[#f5d78a]">
              {t('loginBrandLine')}
            </p>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.2] tracking-tight text-white xl:text-[2.85rem]">
              {t('loginTitle')}
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-8 text-teal-50/80">{t('loginSubtitle')}</p>

            <ul className="mt-10 space-y-3">
              {[
                { icon: Truck, text: t('loginFeatureOps'), delay: 'login-rise-delay-1' },
                { icon: Landmark, text: t('loginFeatureFinance'), delay: 'login-rise-delay-2' },
                { icon: Building2, text: t('loginFeatureCompanies'), delay: 'login-rise-delay-3' },
              ].map((item) => (
                <li
                  key={item.text}
                  className={`login-rise ${item.delay} flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-teal-50/95 backdrop-blur-[2px]`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f5d78a]/15 text-[#f5d78a]">
                    <item.icon className="h-4 w-4" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
            {[
              { value: '۲', label: t('loginStatCompanies') },
              { value: '۱۵+', label: t('loginStatModules') },
              { value: '۲', label: t('loginStatLangs') },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="mt-1 text-[11px] leading-5 text-teal-100/65">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="relative flex min-h-[100dvh] flex-col bg-[#f6f3ec]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0f766e]/8 to-transparent lg:hidden" />

        <header className="relative z-10 flex items-center justify-between px-5 pt-[max(1.1rem,env(safe-area-inset-top))] sm:px-8">
          <div className="flex items-center gap-3 lg:invisible">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0f766e] text-sm font-extrabold text-[#f5d78a]">
              ت
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900">{t('appName')}</p>
              <p className="text-[11px] text-slate-500">{t('appTagline')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleLocale}
            className="inline-flex h-10 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-teal-200 hover:text-teal-800"
          >
            <Globe2 className="h-4 w-4" />
            {locale === 'fa' ? 'English' : 'فارسی'}
          </button>
        </header>

        <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
          <div className="login-rise w-full max-w-[420px]">
            <div className="overflow-hidden rounded-[28px] border border-[#e7e0d2] bg-white shadow-[0_28px_80px_rgba(20,40,36,0.12)]">
              <div className="h-1 bg-gradient-to-l from-[#0f766e] via-[#f5d78a] to-[#0f766e]" />
              <div className="p-6 sm:p-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
                  {t('loginWelcome')}
                </p>
                <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900">
                  {t('login')}
                </h2>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{t('loginUseAccount')}</p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  {error ? (
                    <div className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                      {t('email')}
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                        placeholder="name@company.com"
                        className="h-12 rounded-2xl border-slate-200 bg-[#faf8f4] ps-11 text-left"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                      {t('password')}
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                        placeholder="••••••••"
                        className="h-12 rounded-2xl border-slate-200 bg-[#faf8f4] ps-11 pe-11 text-left"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-700"
                        aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-1 h-12 w-full rounded-2xl bg-[#0f766e] text-[15px] font-bold shadow-lg shadow-teal-800/15 hover:bg-[#0d5f58]"
                    disabled={loading}
                  >
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
                  <div className="mt-6 border-t border-[#efe8db] pt-5">
                    <p className="mb-3 text-xs font-semibold text-slate-500">{t('loginDemoTitle')}</p>
                    <div className="grid gap-2">
                      {DEMO_ACCOUNTS.map((account) => {
                        const active = selectedDemo === account.id;
                        return (
                          <button
                            key={account.id}
                            type="button"
                            onClick={() => fillDemo(account)}
                            className={`flex w-full items-center justify-between rounded-2xl border px-3.5 py-2.5 text-start transition ${
                              active
                                ? 'border-[#d4b45a] bg-[#fff8e8] shadow-sm'
                                : 'border-slate-200 bg-[#faf8f4] hover:border-teal-200 hover:bg-teal-50/70'
                            }`}
                          >
                            <span>
                              <span className="block text-sm font-semibold text-slate-800">
                                {t(account.labelKey)}
                              </span>
                              <span className="mt-0.5 block text-[11px] text-slate-500" dir="ltr">
                                {account.email}
                              </span>
                            </span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-teal-800 ring-1 ring-[#e7e0d2]">
                              {t(account.companyKey)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('loginSecureSession')}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('loginSecureSession')}
              <span className="text-slate-300">·</span>
              {t('companyArya')}
              <span className="text-slate-300">/</span>
              {t('companyTurkmen')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
