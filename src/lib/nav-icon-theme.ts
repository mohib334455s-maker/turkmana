/** Soft accent palette per module — colorful but professional (Lucide icons) */

export type NavIconTheme = {
  iconBg: string;
  iconText: string;
  iconBorder: string;
  activeIconBg: string;
  activeIconText: string;
  activeIconBorder: string;
  navActiveBg: string;
  navActiveText: string;
  cardBg: string;
  cardBorder: string;
  dot: string;
  childActive: string;
};

const defaultTheme: NavIconTheme = {
  iconBg: 'bg-teal-50',
  iconText: 'text-teal-600',
  iconBorder: 'border-teal-100',
  activeIconBg: 'bg-teal-100',
  activeIconText: 'text-teal-700',
  activeIconBorder: 'border-teal-200',
  navActiveBg: 'bg-teal-50',
  navActiveText: 'text-teal-900',
  cardBg: 'from-teal-50/60 to-white',
  cardBorder: 'border-teal-100 hover:border-teal-200',
  dot: 'bg-teal-400',
  childActive: 'bg-teal-50 text-teal-800 border-teal-100',
};

const themes: Record<string, NavIconTheme> = {
  dashboard: defaultTheme,
  contracts: {
    iconBg: 'bg-sky-50', iconText: 'text-sky-600', iconBorder: 'border-sky-100',
    activeIconBg: 'bg-sky-100', activeIconText: 'text-sky-700', activeIconBorder: 'border-sky-200',
    navActiveBg: 'bg-sky-50', navActiveText: 'text-sky-900',
    cardBg: 'from-sky-50/60 to-white', cardBorder: 'border-sky-100 hover:border-sky-200',
    dot: 'bg-sky-400', childActive: 'bg-sky-50 text-sky-800 border-sky-100',
  },
  imports: {
    iconBg: 'bg-cyan-50', iconText: 'text-cyan-600', iconBorder: 'border-cyan-100',
    activeIconBg: 'bg-cyan-100', activeIconText: 'text-cyan-700', activeIconBorder: 'border-cyan-200',
    navActiveBg: 'bg-cyan-50', navActiveText: 'text-cyan-900',
    cardBg: 'from-cyan-50/60 to-white', cardBorder: 'border-cyan-100 hover:border-cyan-200',
    dot: 'bg-cyan-400', childActive: 'bg-cyan-50 text-cyan-800 border-cyan-100',
  },
  purchases: {
    iconBg: 'bg-orange-50', iconText: 'text-orange-600', iconBorder: 'border-orange-100',
    activeIconBg: 'bg-orange-100', activeIconText: 'text-orange-700', activeIconBorder: 'border-orange-200',
    navActiveBg: 'bg-orange-50', navActiveText: 'text-orange-900',
    cardBg: 'from-orange-50/60 to-white', cardBorder: 'border-orange-100 hover:border-orange-200',
    dot: 'bg-orange-400', childActive: 'bg-orange-50 text-orange-800 border-orange-100',
  },
  sales: {
    iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', iconBorder: 'border-emerald-100',
    activeIconBg: 'bg-emerald-100', activeIconText: 'text-emerald-700', activeIconBorder: 'border-emerald-200',
    navActiveBg: 'bg-emerald-50', navActiveText: 'text-emerald-900',
    cardBg: 'from-emerald-50/60 to-white', cardBorder: 'border-emerald-100 hover:border-emerald-200',
    dot: 'bg-emerald-400', childActive: 'bg-emerald-50 text-emerald-800 border-emerald-100',
  },
  customers: {
    iconBg: 'bg-violet-50', iconText: 'text-violet-600', iconBorder: 'border-violet-100',
    activeIconBg: 'bg-violet-100', activeIconText: 'text-violet-700', activeIconBorder: 'border-violet-200',
    navActiveBg: 'bg-violet-50', navActiveText: 'text-violet-900',
    cardBg: 'from-violet-50/60 to-white', cardBorder: 'border-violet-100 hover:border-violet-200',
    dot: 'bg-violet-400', childActive: 'bg-violet-50 text-violet-800 border-violet-100',
  },
  suppliers: {
    iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', iconBorder: 'border-indigo-100',
    activeIconBg: 'bg-indigo-100', activeIconText: 'text-indigo-700', activeIconBorder: 'border-indigo-200',
    navActiveBg: 'bg-indigo-50', navActiveText: 'text-indigo-900',
    cardBg: 'from-indigo-50/60 to-white', cardBorder: 'border-indigo-100 hover:border-indigo-200',
    dot: 'bg-indigo-400', childActive: 'bg-indigo-50 text-indigo-800 border-indigo-100',
  },
  warehouses: {
    iconBg: 'bg-amber-50', iconText: 'text-amber-600', iconBorder: 'border-amber-100',
    activeIconBg: 'bg-amber-100', activeIconText: 'text-amber-700', activeIconBorder: 'border-amber-200',
    navActiveBg: 'bg-amber-50', navActiveText: 'text-amber-900',
    cardBg: 'from-amber-50/60 to-white', cardBorder: 'border-amber-100 hover:border-amber-200',
    dot: 'bg-amber-400', childActive: 'bg-amber-50 text-amber-800 border-amber-100',
  },
  transport: {
    iconBg: 'bg-blue-50', iconText: 'text-blue-600', iconBorder: 'border-blue-100',
    activeIconBg: 'bg-blue-100', activeIconText: 'text-blue-700', activeIconBorder: 'border-blue-200',
    navActiveBg: 'bg-blue-50', navActiveText: 'text-blue-900',
    cardBg: 'from-blue-50/60 to-white', cardBorder: 'border-blue-100 hover:border-blue-200',
    dot: 'bg-blue-400', childActive: 'bg-blue-50 text-blue-800 border-blue-100',
  },
  finance: {
    iconBg: 'bg-teal-50', iconText: 'text-teal-600', iconBorder: 'border-teal-100',
    activeIconBg: 'bg-teal-100', activeIconText: 'text-teal-700', activeIconBorder: 'border-teal-200',
    navActiveBg: 'bg-teal-50', navActiveText: 'text-teal-900',
    cardBg: 'from-teal-50/60 to-white', cardBorder: 'border-teal-100 hover:border-teal-200',
    dot: 'bg-teal-400', childActive: 'bg-teal-50 text-teal-800 border-teal-100',
  },
  exchange: {
    iconBg: 'bg-lime-50', iconText: 'text-lime-700', iconBorder: 'border-lime-100',
    activeIconBg: 'bg-lime-100', activeIconText: 'text-lime-800', activeIconBorder: 'border-lime-200',
    navActiveBg: 'bg-lime-50', navActiveText: 'text-lime-900',
    cardBg: 'from-lime-50/60 to-white', cardBorder: 'border-lime-100 hover:border-lime-200',
    dot: 'bg-lime-500', childActive: 'bg-lime-50 text-lime-900 border-lime-100',
  },
  hr: {
    iconBg: 'bg-rose-50', iconText: 'text-rose-600', iconBorder: 'border-rose-100',
    activeIconBg: 'bg-rose-100', activeIconText: 'text-rose-700', activeIconBorder: 'border-rose-200',
    navActiveBg: 'bg-rose-50', navActiveText: 'text-rose-900',
    cardBg: 'from-rose-50/60 to-white', cardBorder: 'border-rose-100 hover:border-rose-200',
    dot: 'bg-rose-400', childActive: 'bg-rose-50 text-rose-800 border-rose-100',
  },
  documents: {
    iconBg: 'bg-fuchsia-50', iconText: 'text-fuchsia-600', iconBorder: 'border-fuchsia-100',
    activeIconBg: 'bg-fuchsia-100', activeIconText: 'text-fuchsia-700', activeIconBorder: 'border-fuchsia-200',
    navActiveBg: 'bg-fuchsia-50', navActiveText: 'text-fuchsia-900',
    cardBg: 'from-fuchsia-50/60 to-white', cardBorder: 'border-fuchsia-100 hover:border-fuchsia-200',
    dot: 'bg-fuchsia-400', childActive: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-100',
  },
  reports: {
    iconBg: 'bg-cyan-50', iconText: 'text-cyan-700', iconBorder: 'border-cyan-100',
    activeIconBg: 'bg-cyan-100', activeIconText: 'text-cyan-800', activeIconBorder: 'border-cyan-200',
    navActiveBg: 'bg-cyan-50', navActiveText: 'text-cyan-900',
    cardBg: 'from-cyan-50/60 to-white', cardBorder: 'border-cyan-100 hover:border-cyan-200',
    dot: 'bg-cyan-500', childActive: 'bg-cyan-50 text-cyan-900 border-cyan-100',
  },
  notifications: {
    iconBg: 'bg-amber-50', iconText: 'text-amber-600', iconBorder: 'border-amber-100',
    activeIconBg: 'bg-amber-100', activeIconText: 'text-amber-700', activeIconBorder: 'border-amber-200',
    navActiveBg: 'bg-amber-50', navActiveText: 'text-amber-900',
    cardBg: 'from-amber-50/60 to-white', cardBorder: 'border-amber-100 hover:border-amber-200',
    dot: 'bg-amber-400', childActive: 'bg-amber-50 text-amber-800 border-amber-100',
  },
  settings: {
    iconBg: 'bg-slate-100', iconText: 'text-slate-600', iconBorder: 'border-slate-200',
    activeIconBg: 'bg-slate-200', activeIconText: 'text-slate-700', activeIconBorder: 'border-slate-300',
    navActiveBg: 'bg-slate-100', navActiveText: 'text-slate-900',
    cardBg: 'from-slate-50 to-white', cardBorder: 'border-slate-200 hover:border-slate-300',
    dot: 'bg-slate-400', childActive: 'bg-slate-100 text-slate-800 border-slate-200',
  },
};

export function getNavIconTheme(moduleKey?: string): NavIconTheme {
  if (!moduleKey) return defaultTheme;
  return themes[moduleKey] ?? defaultTheme;
}

const topBars: Record<string, string> = {
  dashboard: 'bg-teal-500',
  contracts: 'bg-sky-500',
  imports: 'bg-cyan-500',
  purchases: 'bg-orange-500',
  sales: 'bg-emerald-500',
  customers: 'bg-violet-500',
  suppliers: 'bg-indigo-500',
  warehouses: 'bg-amber-500',
  transport: 'bg-blue-500',
  finance: 'bg-teal-500',
  exchange: 'bg-lime-500',
  hr: 'bg-rose-500',
  documents: 'bg-fuchsia-500',
  reports: 'bg-cyan-500',
  notifications: 'bg-amber-500',
  settings: 'bg-slate-500',
};

export function getModuleTopBar(moduleKey?: string): string {
  if (!moduleKey) return 'bg-teal-500';
  return topBars[moduleKey] ?? 'bg-teal-500';
}
