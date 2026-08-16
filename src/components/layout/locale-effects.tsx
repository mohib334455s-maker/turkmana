'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/lib/i18n/store';

export function LocaleEffects() {
  const locale = useUiStore((s) => s.locale);

  useEffect(() => {
    const dir = locale === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }, [locale]);

  return null;
}
