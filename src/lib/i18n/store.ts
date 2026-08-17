'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { pickLocaleLabel } from './label-map';
import { messages, type Locale, type MessageKey, type NavKey } from './messages';

interface UiState {
  locale: Locale;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  navExpanded: Record<string, boolean>;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  toggleNavExpanded: (key: string) => void;
  setNavExpanded: (key: string, open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      locale: 'fa',
      sidebarCollapsed: false,
      mobileNavOpen: false,
      navExpanded: {},
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set({ locale: get().locale === 'fa' ? 'en' : 'fa' }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      toggleMobileNav: () =>
        set({ mobileNavOpen: !get().mobileNavOpen }),
      toggleNavExpanded: (key) =>
        set({
          navExpanded: {
            ...get().navExpanded,
            [key]: !get().navExpanded[key],
          },
        }),
      setNavExpanded: (key, open) =>
        set({
          navExpanded: {
            ...get().navExpanded,
            [key]: open,
          },
        }),
    }),
    { name: 'erp-ui-prefs' }
  )
);

export function useI18n() {
  const locale = useUiStore((s) => s.locale);
  const dict = messages[locale];
  const t = (key: MessageKey) => dict[key] as string;
  const tn = (key: NavKey) => dict.nav[key];
  const dir = locale === 'fa' ? 'rtl' : 'ltr';
  const tx = (fa: string, en: string) => (locale === 'en' ? en : fa);
  const pick = (label: string) => pickLocaleLabel(label, locale);
  return { locale, dir, t, tn, dict, tx, pick };
}
