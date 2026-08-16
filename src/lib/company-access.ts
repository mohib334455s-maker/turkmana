import type { CompanyFilter } from '@/lib/company-store';

export type CompanyAccess = 'arya' | 'turkmen' | 'both';

export const COMPANY_ACCESS_LABELS: Record<
  CompanyAccess,
  { fa: string; en: string }
> = {
  arya: { fa: 'فقط آریا', en: 'Arya only' },
  turkmen: { fa: 'فقط ترکمن', en: 'Turkmen only' },
  both: { fa: 'هر دو شرکت', en: 'Both companies' },
};

export function asCompanyAccess(value?: string): CompanyAccess {
  if (value === 'arya' || value === 'turkmen' || value === 'both') return value;
  return 'arya';
}

export function allowedCompanyFilters(access: CompanyAccess): CompanyFilter[] {
  if (access === 'both') return ['arya', 'turkmen', 'both'];
  return [access];
}

export function clampCompany(
  current: CompanyFilter,
  access: CompanyAccess
): CompanyFilter {
  const allowed = allowedCompanyFilters(access);
  return allowed.includes(current) ? current : access;
}

export function canGrantBothCompanies(role?: string) {
  return role === 'admin';
}
