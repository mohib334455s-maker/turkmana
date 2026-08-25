'use client';

import { useMemo } from 'react';
import { recordCompanyOptions } from '@/lib/company-access';
import { resolveRecordCompany, useCompanyStore } from '@/lib/company-store';
import { useAuthStore } from '@/lib/auth-store';
import { useI18n } from '@/lib/i18n/store';

/** Company options for create/edit forms — respects view filter + user access. */
export function useCompanyFormOptions() {
  const { t } = useI18n();
  const company = useCompanyStore((s) => s.company);
  const companyAccess = useAuthStore((s) => s.companyAccess);

  const options = useMemo(
    () =>
      recordCompanyOptions(company, companyAccess, {
        arya: t('companyArya'),
        turkmen: t('companyTurkmen'),
      }),
    [company, companyAccess, t]
  );

  const defaultCompany = resolveRecordCompany(
    company,
    options[0]?.value ?? 'arya'
  );

  /** When only one option, hide the company select in forms */
  const showCompanyField = options.length > 1;

  return { options, defaultCompany, showCompanyField, viewCompany: company };
}
