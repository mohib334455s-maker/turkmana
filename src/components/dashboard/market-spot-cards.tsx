'use client';

import { useEffect, useState } from 'react';
import { Droplets, Flame, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { buildSpotQuotes, type SpotQuote } from '@/lib/market-prices';
import { useI18n } from '@/lib/i18n/store';
import { cn, formatNumber } from '@/lib/utils';

const ICONS = {
  gold: Sparkles,
  oil: Droplets,
  gas: Flame,
} as const;

const TONES = {
  gold: {
    card: 'from-amber-500 via-yellow-600 to-amber-800',
    soft: 'bg-amber-50 text-amber-800',
  },
  oil: {
    card: 'from-slate-700 via-slate-800 to-black',
    soft: 'bg-slate-100 text-slate-800',
  },
  gas: {
    card: 'from-sky-500 via-cyan-600 to-teal-700',
    soft: 'bg-cyan-50 text-cyan-900',
  },
} as const;

function useSpotQuotes() {
  const [quotes, setQuotes] = useState<SpotQuote[]>(() => buildSpotQuotes());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch('/api/market-prices', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { quotes?: SpotQuote[] };
        if (alive && data.quotes?.length) setQuotes(data.quotes);
      } catch {
        if (alive) setQuotes(buildSpotQuotes());
      }
    };
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, []);

  return quotes;
}

/** Compact panel for the executive dashboard hero (right side). */
export function MarketSpotHeroPanel({ className }: { className?: string }) {
  const { locale, tx } = useI18n();
  const quotes = useSpotQuotes();

  return (
    <div className={cn('relative flex h-full min-h-[400px] flex-col p-6 xl:p-8', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#134e4a]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_45%)]" />
      <div className="relative z-10 flex flex-1 flex-col">
        <div>
          <p className="text-sm font-bold text-white">
            {tx('قیمت لحظه‌ای بازار جهانی', 'Live world market prices')}
          </p>
          <p className="mt-1 text-xs leading-5 text-teal-100/80">
            {tx('طلا · تیل · گاز — صعود / نزول', 'Gold · oil · gas — up / down')}
          </p>
        </div>

        <div className="mt-5 flex flex-1 flex-col justify-center gap-3">
          {quotes.map((q) => {
            const Icon = ICONS[q.id];
            const up = q.changePct >= 0;
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                      <Icon className="h-4 w-4 text-white" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {locale === 'en' ? q.en : q.fa}
                      </p>
                      <p className="text-[10px] text-teal-100/75">
                        {locale === 'en' ? q.unitEn : q.unitFa}
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-lg font-extrabold num text-white">
                      {formatNumber(q.price, q.id === 'gas' ? 3 : 2)}
                    </p>
                    <span
                      className={cn(
                        'mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-bold',
                        up ? 'text-emerald-200' : 'text-rose-200'
                      )}
                    >
                      {up ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="num">
                        {up ? '+' : ''}
                        {formatNumber(q.changePct, 2)}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="relative mt-4 text-[10px] text-teal-100/60 num">
          {tx('به‌روزرسانی', 'Updated')}:{' '}
          {quotes[0]
            ? new Date(quotes[0].updatedAt).toLocaleTimeString(
                locale === 'fa' ? 'fa-AF' : 'en-GB',
                { hour: '2-digit', minute: '2-digit' }
              )
            : '—'}
        </p>
      </div>
    </div>
  );
}

export function MarketSpotCards() {
  const { locale, tx } = useI18n();
  const quotes = useSpotQuotes();

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            {tx('قیمت لحظه‌ای بازار جهانی', 'Live world market prices')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {tx(
              'طلا، تیل و گاز — نرخ مرجع با نشان صعود / نزول',
              'Gold, oil and gas — reference rates with up / down markers'
            )}
          </p>
        </div>
        <p className="text-[11px] text-slate-400 num">
          {tx('به‌روزرسانی', 'Updated')}:{' '}
          {quotes[0]
            ? new Date(quotes[0].updatedAt).toLocaleTimeString(
                locale === 'fa' ? 'fa-AF' : 'en-GB',
                { hour: '2-digit', minute: '2-digit' }
              )
            : '—'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quotes.map((q) => {
          const Icon = ICONS[q.id];
          const tone = TONES[q.id];
          const up = q.changePct >= 0;
          return (
            <Card
              key={q.id}
              className="overflow-hidden rounded-[24px] border-0 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.45)]"
            >
              <div className={cn('bg-gradient-to-br px-5 pb-4 pt-5 text-white', tone.card)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white/95">
                        {locale === 'en' ? q.en : q.fa}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/70">
                        {locale === 'en' ? q.unitEn : q.unitFa}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold',
                      up ? 'bg-emerald-400/25 text-emerald-50' : 'bg-rose-400/25 text-rose-50'
                    )}
                  >
                    {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span className="num">
                      {up ? '+' : ''}
                      {formatNumber(q.changePct, 2)}%
                    </span>
                  </span>
                </div>
                <p className="mt-6 text-3xl font-extrabold tracking-tight num">
                  {formatNumber(q.price, q.id === 'gas' ? 3 : 2)}
                  <span className="ms-2 text-sm font-semibold text-white/75">USD</span>
                </p>
              </div>
              <CardContent className={cn('px-5 py-3 text-xs font-medium', tone.soft)}>
                {up
                  ? tx('روند صعودی نسبت به بازه قبل', 'Trending up vs previous window')
                  : tx('روند نزولی نسبت به بازه قبل', 'Trending down vs previous window')}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
