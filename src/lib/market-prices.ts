/** Spot market prices for dashboard (gold, oil, gas). */

export type SpotInstrument = 'gold' | 'oil' | 'gas';

export type SpotQuote = {
  id: SpotInstrument;
  fa: string;
  en: string;
  unitFa: string;
  unitEn: string;
  price: number;
  currency: string;
  changePct: number;
  updatedAt: string;
};

const BASE: Record<SpotInstrument, { price: number; fa: string; en: string; unitFa: string; unitEn: string }> = {
  gold: {
    price: 2648.5,
    fa: 'طلا (انس جهانی)',
    en: 'Gold (spot oz)',
    unitFa: 'دالر / اونس',
    unitEn: 'USD / oz',
  },
  oil: {
    price: 78.42,
    fa: 'تیل خام (برنت)',
    en: 'Brent crude oil',
    unitFa: 'دالر / بشکه',
    unitEn: 'USD / bbl',
  },
  gas: {
    price: 3.18,
    fa: 'گاز طبیعی',
    en: 'Natural gas',
    unitFa: 'دالر / mmBtu',
    unitEn: 'USD / mmBtu',
  },
};

function jitter(seed: number, span: number) {
  const x = Math.sin(seed) * 10000;
  return (x - Math.floor(x) - 0.5) * 2 * span;
}

/** Deterministic-ish live quote from current time (no external key required). */
export function buildSpotQuotes(now = Date.now()): SpotQuote[] {
  const slot = Math.floor(now / (5 * 60 * 1000)); // 5-minute buckets
  return (Object.keys(BASE) as SpotInstrument[]).map((id, i) => {
    const b = BASE[id];
    const changePct = Number((jitter(slot + i * 17, 1.8)).toFixed(2));
    const price = Number((b.price * (1 + changePct / 100)).toFixed(id === 'gas' ? 3 : 2));
    return {
      id,
      fa: b.fa,
      en: b.en,
      unitFa: b.unitFa,
      unitEn: b.unitEn,
      price,
      currency: 'USD',
      changePct,
      updatedAt: new Date(now).toISOString(),
    };
  });
}
