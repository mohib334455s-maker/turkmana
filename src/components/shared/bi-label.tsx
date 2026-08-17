'use client';

import { useI18n } from '@/lib/i18n/store';
import { pickLocaleLabel } from '@/lib/i18n/label-map';
import { cn } from '@/lib/utils';

export function splitBi(label: string): { fa: string; en: string } {
  if (!label.includes('|')) return { fa: label, en: pickLocaleLabel(label, 'en') };
  const [fa, en] = label.split('|');
  return { fa: fa.trim(), en: (en || fa).trim() };
}

export function pickLabel(label: string, locale: 'fa' | 'en') {
  return pickLocaleLabel(label, locale);
}

/** Shows only the active language — never FA and EN glued together. */
export function BiLabel({
  fa,
  en,
  className,
}: {
  fa: string;
  en: string;
  className?: string;
}) {
  const { locale } = useI18n();
  return <span className={cn(className)}>{locale === 'en' ? en : fa}</span>;
}

export function StackLabel({ label, className }: { label: string; className?: string }) {
  const { locale } = useI18n();
  return <span className={className}>{pickLabel(label, locale)}</span>;
}
