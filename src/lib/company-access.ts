import type { CompanyFilter } from '@/lib/company-store';

export type CompanyAccess = 'arya' | 'turkmen' | 'both';

export const COMPANY_ACCESS_LABELS: Record<
  CompanyAccess,
  { fa: string; en: string }
> = {
  arya: { fa: 'فقط آریا', en: 'Arya only' },
  turkmen: { fa: 'فقط ترکمن', en: 'Turkmen only' },
  both: { fa: 'آریا و ترکمن (سوئیچ)', en: 'Arya & Turkmen (switch)' },
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
