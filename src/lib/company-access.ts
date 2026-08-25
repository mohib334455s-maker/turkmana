import type { CompanyFilter } from '@/lib/company-store';

export type CompanyAccess = 'arya' | 'turkmen' | 'both';

export const COMPANY_ACCESS_LABELS: Record<
  CompanyAccess,
  { fa: string; en: string }
> = {
  arya: { fa: 'فقط آزیا آریا لمتید', en: 'Azya Aria LTD only' },
  turkmen: { fa: 'فقط ترکمن پطرولیم', en: 'Turkmen Petroleum only' },
  both: { fa: 'آزیا آریا لمتید و ترکمن پطرولیم (سوئیچ)', en: 'Azya Aria LTD & Turkmen Petroleum (switch)' },
};

export function asCompanyAccess(value?: string): CompanyAccess {
  if (value === 'arya' || value === 'turkmen' || value === 'both') return value;
  return 'arya';
}

export function allowedCompanyFilters(access: CompanyAccess): CompanyFilter[] {
  if (access === 'both') return ['arya', 'turkmen'];
  return [access];
}

export function clampCompany(
  current: CompanyFilter | 'both',
  access: CompanyAccess
): CompanyFilter {
  const allowed = allowedCompanyFilters(access);
  if (current === 'both') return allowed[0] ?? 'turkmen';
  return allowed.includes(current) ? current : (allowed[0] ?? 'turkmen');
}

export function canGrantBothCompanies(role?: string) {
  return role === 'admin';
}
