import type { CompanyFilter, RecordCompany } from '@/lib/company-store';

export type CompanyAccess = 'arya' | 'turkmen' | 'both';

export const COMPANY_ACCESS_LABELS: Record<
  CompanyAccess,
  { fa: string; en: string }
> = {
  arya: { fa: 'فقط آزیا آریا لمتید', en: 'Azya Aria LTD only' },
  turkmen: { fa: 'فقط ترکمن پطرولیم', en: 'Turkmen Petroleum only' },
  both: {
    fa: 'هر دو شرکت (قدرت انتخاب)',
    en: 'Both companies (can switch)',
  },
};

export function asCompanyAccess(value?: string): CompanyAccess {
  if (value === 'arya' || value === 'turkmen' || value === 'both') return value;
  return 'arya';
}

/** Switcher options based on user access — single access never sees «both». */
export function allowedCompanyFilters(access: CompanyAccess): CompanyFilter[] {
  if (access === 'both') return ['arya', 'turkmen', 'both'];
  return [access];
}

export function clampCompany(
  current: CompanyFilter | string,
  access: CompanyAccess
): CompanyFilter {
  const allowed = allowedCompanyFilters(access);
  if (allowed.includes(current as CompanyFilter)) return current as CompanyFilter;
  return allowed.includes('both')
    ? 'both'
    : ((allowed[0] as CompanyFilter) ?? 'turkmen');
}

export function canGrantBothCompanies(role?: string) {
  return role === 'admin';
}

/** Options for create/edit forms: one company view → hide the other. */
export function recordCompanyOptions(
  filter: CompanyFilter,
  access: CompanyAccess,
  labels: { arya: string; turkmen: string }
): Array<{ value: RecordCompany; label: string }> {
  if (access === 'arya') return [{ value: 'arya', label: labels.arya }];
  if (access === 'turkmen') return [{ value: 'turkmen', label: labels.turkmen }];
  // access both: if viewing one company, lock form to that company
  if (filter === 'arya') return [{ value: 'arya', label: labels.arya }];
  if (filter === 'turkmen') return [{ value: 'turkmen', label: labels.turkmen }];
  return [
    { value: 'arya', label: labels.arya },
    { value: 'turkmen', label: labels.turkmen },
  ];
}
