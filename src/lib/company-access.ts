import type { CompanyFilter, RecordCompany } from '@/lib/company-store';

/**
 * User permission: which companies they may open.
 * «both» = can switch between Arya and Turkmen (not a third books view).
 */
export type CompanyAccess = 'arya' | 'turkmen' | 'both';

export const COMPANY_ACCESS_LABELS: Record<
  CompanyAccess,
  { fa: string; en: string }
> = {
  arya: { fa: 'فقط آزیا آریا لمتید', en: 'Azya Aria LTD only' },
  turkmen: { fa: 'فقط ترکمن پطرولیم', en: 'Turkmen Petroleum only' },
  both: {
    fa: 'هر دو شرکت (قدرت انتخاب یکی)',
    en: 'Both companies (pick one at a time)',
  },
};

export function asCompanyAccess(value?: string): CompanyAccess {
  if (value === 'arya' || value === 'turkmen' || value === 'both') return value;
  return 'arya';
}

/** Header switcher: never includes a «both» books mode. */
export function allowedCompanyFilters(access: CompanyAccess): CompanyFilter[] {
  if (access === 'both') return ['arya', 'turkmen'];
  return [access];
}

export function clampCompany(
  current: CompanyFilter | string,
  access: CompanyAccess
): CompanyFilter {
  const allowed = allowedCompanyFilters(access);
  if (allowed.includes(current as CompanyFilter)) return current as CompanyFilter;
  return allowed[0] ?? 'arya';
}

export function canGrantBothCompanies(role?: string) {
  return role === 'admin';
}

/**
 * Create/edit forms: only Arya or Turkmen — never «both».
 * Locked to the active header company when user is viewing one company.
 */
export function recordCompanyOptions(
  filter: CompanyFilter,
  access: CompanyAccess,
  labels: { arya: string; turkmen: string }
): Array<{ value: RecordCompany; label: string }> {
  if (access === 'arya') return [{ value: 'arya', label: labels.arya }];
  if (access === 'turkmen') return [{ value: 'turkmen', label: labels.turkmen }];
  // Access both: while viewing one company, lock new records to that company
  if (filter === 'arya') return [{ value: 'arya', label: labels.arya }];
  if (filter === 'turkmen') return [{ value: 'turkmen', label: labels.turkmen }];
  return [
    { value: 'arya', label: labels.arya },
    { value: 'turkmen', label: labels.turkmen },
  ];
}
