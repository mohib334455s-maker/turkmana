'use client';

import { Suspense } from 'react';
import { CrudPage, type CrudModuleConfig } from '@/components/shared/crud-page';
import { useI18n } from '@/lib/i18n/store';

/** Alias kept for generated module pages */
export function LocalizedCrud(props: CrudModuleConfig) {
  const { t } = useI18n();
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">{t('loading')}</div>}>
      <CrudPage {...props} />
    </Suspense>
  );
}
