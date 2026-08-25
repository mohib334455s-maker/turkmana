/** Brand assets for Arya / Turkmen companies */

export const ARYA_LOGO_SRC = '/logo-arya.png';
export const TURKMEN_LOGO_SRC = '/logo-turkmen.png';

export type BrandCompany = 'arya' | 'turkmen' | string;

export function isAryaCompany(company?: BrandCompany | null) {
  return company === 'arya';
}

export function isTurkmenCompany(company?: BrandCompany | null) {
  return company === 'turkmen';
}

export function companyBrandName(company?: BrandCompany | null, locale: 'fa' | 'en' = 'fa') {
  if (company === 'arya') return locale === 'en' ? 'Azya Aria LTD' : 'آزیا آریا لمتید';
  if (company === 'turkmen')
    return locale === 'en' ? 'Turkmen Petroleum Company' : 'ترکمن پطرولیم';
  return locale === 'en' ? 'Company' : 'شرکت';
}

/** Absolute URL for print windows (same origin). */
export function brandLogoAbsoluteUrl(company?: BrandCompany | null) {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  if (company === 'arya') return `${origin}${ARYA_LOGO_SRC}`;
  if (company === 'turkmen') return `${origin}${TURKMEN_LOGO_SRC}`;
  return '';
}

/** Single company logo for print HTML (no added background). */
export function brandLogosHtml(company?: BrandCompany | null) {
  const url = brandLogoAbsoluteUrl(company);
  if (!url) return '';
  return `<img src="${url}" alt="${companyBrandName(company)}" class="logo" />`;
}
