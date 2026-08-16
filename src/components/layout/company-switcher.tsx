'use client';

import { useEffect } from 'react';
import {
  useCompanyStore,
  type CompanyFilter,
} from '@/lib/company-store';
import { allowedCompanyFilters, clampCompany } from '@/lib/company-access';
import { useAuthStore } from '@/lib/auth-store';
import { useI18n } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';

export function CompanySwitcher({ className }: { className?: string }) {
  const { company, setCompany } = useCompanyStore();
  const companyAccess = useAuthStore((s) => s.companyAccess);
  const { t } = useI18n();
  const options = allowedCompanyFilters(companyAccess);

  useEffect(() => {
    const next = clampCompany(company, companyAccess);
    if (next !== company) setCompany(next);
  }, [company, companyAccess, setCompany]);

  const labels: Record<CompanyFilter, string> = {
    arya: t('companyArya'),
    turkmen: t('companyTurkmen'),
    both: t('companyBoth'),
  };

  if (options.length === 1) {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800',
          className
        )}
      >
        {labels[options[0]]}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex w-full items-center rounded-full bg-slate-100 p-1 sm:w-auto',
        className
      )}
    >
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setCompany(opt)}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-xs font-semibold transition sm:flex-none sm:px-4',
            company === opt
              ? 'bg-teal-500 text-white shadow-sm shadow-teal-200/70'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}
