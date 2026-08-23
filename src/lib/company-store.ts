'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CompanyFilter = 'arya' | 'turkmen';

export const COMPANY_LABELS: Record<CompanyFilter, string> = {
  arya: 'آزیا آریا لمتید',
  turkmen: 'ترکمن',
};

interface CompanyState {
  company: CompanyFilter;
  setCompany: (company: CompanyFilter) => void;
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: 'turkmen',
      setCompany: (company) => set({ company }),
    }),
    {
      name: 'erp-company-filter',
      version: 3,
      migrate: (persisted) => {
        const state = persisted as { company?: string; state?: { company?: string } };
        const raw = state?.company ?? state?.state?.company;
        if (raw === 'arya' || raw === 'turkmen') {
          return { company: raw };
        }
        return { company: 'turkmen' as CompanyFilter };
      },
    }
  )
);

export function matchesCompany(
  itemCompany: 'arya' | 'turkmen' | 'both',
  filter: CompanyFilter
): boolean {
  return itemCompany === filter;
}
