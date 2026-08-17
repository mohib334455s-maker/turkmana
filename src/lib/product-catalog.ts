'use client';

import { useMemo } from 'react';
import { MASTER_PRODUCTS } from '@/lib/catalog-master';
import { useOpsStore } from '@/lib/ops-store';
import { useI18n } from '@/lib/i18n/store';

export type CatalogProduct = {
  code: string;
  name: string;
  nameEn: string;
  unit: string;
  label: string;
  category?: string;
};

export function useProductCatalog(): CatalogProduct[] {
  const { locale } = useI18n();
  const crud = useOpsStore((s) => s.crud);
  const settings = crud['crud:کالا|Product'] ?? [];

  return useMemo(() => {
    const fromSettings = settings
      .filter((r) => r.code && r.name && r.status !== 'inactive')
      .map((r) => ({
        code: String(r.code),
        name: String(r.name),
        nameEn: String(r.nameEn || r.name),
        unit: String(r.unit || 'تن'),
        category: String(r.category || ''),
      }));
    const source =
      fromSettings.length > 0
        ? fromSettings
        : MASTER_PRODUCTS.map((p) => ({
            code: p.code,
            name: p.name,
            nameEn: p.nameEn,
            unit: p.unit,
            category: p.category,
          }));
    return source.map((p) => ({
      ...p,
      label: locale === 'en' ? p.nameEn : p.name,
    }));
  }, [locale, settings]);
}
