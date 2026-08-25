'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CURRENCY_CATALOG,
  defaultEnabledCurrencyCodes,
  type CurrencyDef,
} from '@/lib/currency-catalog';

type CurrencyState = {
  enabledCodes: string[];
  toggle: (code: string) => void;
  setEnabled: (codes: string[]) => void;
  isEnabled: (code: string) => boolean;
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      enabledCodes: defaultEnabledCurrencyCodes(),
      toggle: (code) => {
        const cur = get().enabledCodes;
        if (cur.includes(code)) {
          // Keep at least one currency
          if (cur.length <= 1) return;
          set({ enabledCodes: cur.filter((c) => c !== code) });
        } else {
          set({ enabledCodes: [...cur, code] });
        }
      },
      setEnabled: (enabledCodes) => set({ enabledCodes }),
      isEnabled: (code) => get().enabledCodes.includes(code),
    }),
    { name: 'erp-currencies-v1' }
  )
);

export function useEnabledCurrencies(locale: 'fa' | 'en' = 'fa'): Array<CurrencyDef & { label: string }> {
  const enabled = useCurrencyStore((s) => s.enabledCodes);
  return CURRENCY_CATALOG.filter((c) => enabled.includes(c.code)).map((c) => ({
    ...c,
    label: locale === 'en' ? `${c.code} — ${c.en}` : `${c.code} — ${c.fa}`,
  }));
}

export function currencySelectOptions(locale: 'fa' | 'en' = 'fa') {
  const enabled = useCurrencyStore.getState().enabledCodes;
  return CURRENCY_CATALOG.filter((c) => enabled.includes(c.code)).map((c) => ({
    value: c.code,
    label: locale === 'en' ? `${c.code} — ${c.en}` : `${c.code} — ${c.fa}`,
  }));
}
