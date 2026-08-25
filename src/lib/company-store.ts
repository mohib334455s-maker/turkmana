'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Active view filter: one company, or both together */
export type CompanyFilter = 'arya' | 'turkmen' | 'both';

/** Company stamped on a record (records are never "both") */
export type RecordCompany = 'arya' | 'turkmen';

export const COMPANY_LABELS: Record<CompanyFilter, string> = {
  arya: 'آزیا آریا لمتید',
  turkmen: 'ترکمن پطرولیم',
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
    {
      name: 'erp-company-filter',
      version: 4,
      migrate: (persisted) => {
        const state = persisted as { company?: string; state?: { company?: string } };
        const raw = state?.company ?? state?.state?.company;
        if (raw === 'arya' || raw === 'turkmen' || raw === 'both') {
          return { company: raw };
        }
        return { company: 'both' as CompanyFilter };
      },
    }
  )
);

/**
 * When filter is «هر دو» → show all companies.
 * When filter is one company → only that company's rows.
 */
export function matchesCompany(
  itemCompany: 'arya' | 'turkmen' | 'both' | string | undefined,
  filter: CompanyFilter
): boolean {
  if (filter === 'both') return true;
  if (!itemCompany || itemCompany === 'both') return true;
  return itemCompany === filter;
}

/** Locked company for new records when viewing a single company */
export function resolveRecordCompany(
  filter: CompanyFilter,
  fallback: RecordCompany = 'arya'
): RecordCompany {
  if (filter === 'arya' || filter === 'turkmen') return filter;
  return fallback;
}
