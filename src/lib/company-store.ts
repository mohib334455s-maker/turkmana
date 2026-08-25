'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Active working company in the header / filters.
 * Never «both» — each screen shows one company's books.
 */
export type CompanyFilter = 'arya' | 'turkmen';

/** Company stamped on a record (always one company). */
export type RecordCompany = 'arya' | 'turkmen';

export const COMPANY_LABELS: Record<CompanyFilter, string> = {
  arya: 'آزیا آریا لمتید',
  turkmen: 'ترکمن پطرولیم',
};

interface CompanyState {
  company: CompanyFilter;
  setCompany: (company: CompanyFilter) => void;
}

function asCompanyFilter(raw?: string): CompanyFilter {
  if (raw === 'turkmen') return 'turkmen';
  return 'arya';
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      company: 'arya',
      setCompany: (company) => set({ company: asCompanyFilter(company) }),
    }),
    {
      name: 'erp-company-filter',
      version: 5,
      migrate: (persisted) => {
        const state = persisted as { company?: string; state?: { company?: string } };
        const raw = state?.company ?? state?.state?.company;
        return { company: asCompanyFilter(raw) };
      },
    }
  )
);

/**
 * Row belongs to the active company.
 * Legacy rows marked «both» appear under either company until re-saved.
 */
export function matchesCompany(
  itemCompany: 'arya' | 'turkmen' | 'both' | string | undefined,
  filter: CompanyFilter
): boolean {
  if (!itemCompany || itemCompany === 'both') return true;
  return itemCompany === filter;
}

/** Company stamped on new records — always one of the two. */
export function resolveRecordCompany(
  filter: CompanyFilter,
  fallback: RecordCompany = 'arya'
): RecordCompany {
  if (filter === 'arya' || filter === 'turkmen') return filter;
  return fallback;
}

export function normalizeRecordCompany(
  value: string | undefined,
  fallback: RecordCompany = 'arya'
): RecordCompany {
  if (value === 'arya' || value === 'turkmen') return value;
  return fallback;
}
