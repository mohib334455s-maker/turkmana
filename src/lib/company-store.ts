'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CompanyFilter = 'arya' | 'turkmen' | 'both';

export const COMPANY_LABELS: Record<CompanyFilter, string> = {
  arya: 'آریا',
  turkmen: 'ترکمن',
  both: 'هر دو شرکت',
};

interface CompanyState {
  company: CompanyFilter;
  setCompany: (company: CompanyFilter) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: 'both',
      setCompany: (company) => set({ company }),
    }),
    { name: 'erp-company-filter' }
  )
);

export function matchesCompany(
  itemCompany: 'arya' | 'turkmen' | 'both',
  filter: CompanyFilter
): boolean {
  if (filter === 'both') return true;
  if (itemCompany === 'both') return true;
  return itemCompany === filter;
}
