/** Master units & product categories for trading ERP (oil + dry goods). */

export const MEASUREMENT_UNITS = [
  { code: 'BAG', fa: 'خریطه', en: 'Bag' },
  { code: 'CTN', fa: 'کارتن', en: 'Carton' },
  { code: 'TON', fa: 'تن', en: 'Ton' },
  { code: 'BTL', fa: 'بوتل', en: 'Bottle' },
  { code: 'LTR', fa: 'لیتر', en: 'Liter' },
] as const;

export type UnitCode = (typeof MEASUREMENT_UNITS)[number]['code'];

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
  { code: 'SUGAR', name: 'شکر', nameEn: 'Sugar', unit: 'تن', unitCode: 'TON', category: 'SUGAR' },
  { code: 'WHEAT', name: 'گندم', nameEn: 'Wheat', unit: 'تن', unitCode: 'TON', category: 'WHEAT' },
  { code: 'FLOUR', name: 'آرد', nameEn: 'Flour', unit: 'خریطه', unitCode: 'BAG', category: 'FLOUR' },
  { code: 'COOKING-OIL', name: 'روغن خوراکی', nameEn: 'Cooking oil', unit: 'بوتل', unitCode: 'BTL', category: 'OIL' },
  { code: 'RICE', name: 'برنج', nameEn: 'Rice', unit: 'خریطه', unitCode: 'BAG', category: 'GRAIN' },
  { code: 'CEMENT', name: 'سمنت', nameEn: 'Cement', unit: 'تن', unitCode: 'TON', category: 'CEMENT' },
];

export function unitLabel(codeOrName: string, locale: 'fa' | 'en' = 'fa') {
  const found = MEASUREMENT_UNITS.find(
    (u) => u.code === codeOrName || u.fa === codeOrName || u.en === codeOrName
  );
  if (!found) return codeOrName;
  return locale === 'en' ? found.en : found.fa;
}
