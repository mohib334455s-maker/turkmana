/** Master units & product categories for trading ERP (oil + dry goods). */

export const MEASUREMENT_UNITS = [
  { code: 'TON', fa: 'تن', en: 'Ton' },
  { code: 'CTN', fa: 'کارتن', en: 'Carton' },
  { code: 'BAG', fa: 'خریطه', en: 'Bag' },
  { code: 'BTL', fa: 'بوتل', en: 'Bottle' },
  { code: 'LTR', fa: 'لیتر', en: 'Liter' },
  { code: 'KG', fa: 'کیلو', en: 'Kilogram' },
  { code: 'BBL', fa: 'بشکه', en: 'Barrel' },
  { code: 'M3', fa: 'متر مکعب', en: 'Cubic meter' },
  { code: 'PCS', fa: 'عدد', en: 'Piece' },
] as const;

export type UnitCode = (typeof MEASUREMENT_UNITS)[number]['code'];

/** Common Afghan / regional ports & border terminals for storage filters */
export const STORAGE_PORTS = [
  { code: 'TQG', fa: 'تورغندی', en: 'Torghundi' },
  { code: 'AQN', fa: 'آقینه', en: 'Aqina' },
  { code: 'ISL', fa: 'اسلام‌قلعه', en: 'Islam Qala' },
  { code: 'SHI', fa: 'شیرخان‌بندر', en: 'Sherkhan Bandar' },
  { code: 'HRT', fa: 'هرات', en: 'Herat' },
  { code: 'KBL', fa: 'کابل', en: 'Kabul' },
  { code: 'MZR', fa: 'مزارشریف', en: 'Mazar-e-Sharif' },
  { code: 'KND', fa: 'قندهار', en: 'Kandahar' },
  { code: 'DBI', fa: 'دبی', en: 'Dubai' },
  { code: 'BND', fa: 'بندرعباس', en: 'Bandar Abbas' },
  { code: 'OTH', fa: 'سایر', en: 'Other' },
] as const;

export type PortCode = (typeof STORAGE_PORTS)[number]['code'];

export const PRODUCT_CATEGORIES = [
  { code: 'FUEL', fa: 'مواد نفتی', en: 'Petroleum' },
  { code: 'FERT', fa: 'کود کیمیاوی', en: 'Fertilizer' },
  { code: 'CORN', fa: 'جواری', en: 'Corn' },
  { code: 'SUGAR', fa: 'شکر', en: 'Sugar' },
  { code: 'WHEAT', fa: 'گندم', en: 'Wheat' },
  { code: 'FLOUR', fa: 'آرد', en: 'Flour' },
  { code: 'OIL', fa: 'روغن', en: 'Edible oil' },
  { code: 'GRAIN', fa: 'غله‌جات', en: 'Grains' },
  { code: 'CEMENT', fa: 'سمنت و ساختمانی', en: 'Cement & building' },
] as const;

export type CategoryCode = (typeof PRODUCT_CATEGORIES)[number]['code'];

export type MasterProduct = {
  code: string;
  name: string;
  nameEn: string;
  unit: string;
  unitCode: UnitCode;
  category: CategoryCode;
};

/** Default catalog — settings products override when present. */
export const MASTER_PRODUCTS: MasterProduct[] = [
  { code: 'DIESEL', name: 'دیزل', nameEn: 'Diesel', unit: 'تن', unitCode: 'TON', category: 'FUEL' },
  { code: 'PETROL', name: 'پطرول', nameEn: 'Petrol', unit: 'تن', unitCode: 'TON', category: 'FUEL' },
  { code: 'PETROL-92', name: 'پطرول ۹۲', nameEn: 'Petrol 92', unit: 'تن', unitCode: 'TON', category: 'FUEL' },
  { code: 'GAS', name: 'گاز', nameEn: 'Gas', unit: 'تن', unitCode: 'TON', category: 'FUEL' },
  { code: 'LPG', name: 'LPG', nameEn: 'LPG', unit: 'تن', unitCode: 'TON', category: 'FUEL' },
  { code: 'UREA', name: 'کود اوره', nameEn: 'Urea fertilizer', unit: 'تن', unitCode: 'TON', category: 'FERT' },
  { code: 'DAP', name: 'کود DAP', nameEn: 'DAP fertilizer', unit: 'تن', unitCode: 'TON', category: 'FERT' },
  { code: 'CORN', name: 'جواری', nameEn: 'Corn', unit: 'تن', unitCode: 'TON', category: 'CORN' },
  { code: 'SUGAR', name: 'شکر', nameEn: 'Sugar', unit: 'خریطه', unitCode: 'BAG', category: 'SUGAR' },
  { code: 'WHEAT', name: 'گندم', nameEn: 'Wheat', unit: 'تن', unitCode: 'TON', category: 'WHEAT' },
  { code: 'FLOUR', name: 'آرد', nameEn: 'Flour', unit: 'خریطه', unitCode: 'BAG', category: 'FLOUR' },
  { code: 'COOKING-OIL', name: 'روغن خوراکی', nameEn: 'Cooking oil', unit: 'کارتن', unitCode: 'CTN', category: 'OIL' },
  { code: 'OIL', name: 'روغن', nameEn: 'Edible oil', unit: 'کارتن', unitCode: 'CTN', category: 'OIL' },
  { code: 'RICE', name: 'برنج', nameEn: 'Rice', unit: 'خریطه', unitCode: 'BAG', category: 'GRAIN' },
  { code: 'TEA', name: 'چای', nameEn: 'Tea', unit: 'کارتن', unitCode: 'CTN', category: 'GRAIN' },
  { code: 'CEMENT', name: 'سمنت', nameEn: 'Cement', unit: 'تن', unitCode: 'TON', category: 'CEMENT' },
];

export function unitLabel(codeOrName: string, locale: 'fa' | 'en' = 'fa') {
  const found = MEASUREMENT_UNITS.find(
    (u) => u.code === codeOrName || u.fa === codeOrName || u.en === codeOrName
  );
  if (!found) return codeOrName || (locale === 'en' ? 'Ton' : 'تن');
  return locale === 'en' ? found.en : found.fa;
}

export function portLabel(codeOrName: string, locale: 'fa' | 'en' = 'fa') {
  const found = STORAGE_PORTS.find(
    (p) => p.code === codeOrName || p.fa === codeOrName || p.en === codeOrName
  );
  if (!found) return codeOrName;
  return locale === 'en' ? found.en : found.fa;
}

export function unitSelectOptions(locale: 'fa' | 'en' = 'fa') {
  return MEASUREMENT_UNITS.map((u) => ({
    value: u.fa,
    label: locale === 'en' ? `${u.en} (${u.fa})` : u.fa,
  }));
}

export function portSelectOptions(locale: 'fa' | 'en' = 'fa') {
  return STORAGE_PORTS.map((p) => ({
    value: p.fa,
    label: locale === 'en' ? `${p.en} (${p.fa})` : p.fa,
  }));
}
