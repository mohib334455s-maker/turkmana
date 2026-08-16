'use client';

import { Suspense } from 'react';
import { CrudPage, type CrudModuleConfig } from '@/components/shared/crud-page';

/** Alias kept for generated module pages */
export function LocalizedCrud(props: CrudModuleConfig) {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">در حال بارگذاری…</div>}>
      <CrudPage {...props} />
    </Suspense>
  );
}
