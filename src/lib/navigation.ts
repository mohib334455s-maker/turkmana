import {
  LayoutDashboard,
  Users,
  FileText,
  Warehouse,
  TrendingUp,
  DollarSign,
  Settings,
  Building2,
  Truck,
  ShoppingCart,
  BarChart3,
  Ship,
  Landmark,
  Briefcase,
  Bell,
  Handshake,
  type LucideIcon,
} from 'lucide-react';
import type { NavKey } from '@/lib/i18n/messages';

export type NavChild = { key: NavKey; href: string };
export type NavModule = {
  key: NavKey;
  descKey: NavKey;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
  accent: string;
  soft: string;
  ring: string;
};

export const navModules: NavModule[] = [
  {
    key: 'dashboard',
    descKey: 'dashboardDesc',
    icon: LayoutDashboard,
    href: '/dashboard',
    accent: 'text-teal-600',
    soft: 'from-teal-500/15 to-teal-500/5',
    ring: 'ring-teal-200/70',
  },
  {
    key: 'contracts',
    descKey: 'contractsDesc',
    icon: FileText,
    accent: 'text-sky-600',
    soft: 'from-sky-500/15 to-sky-500/5',
    ring: 'ring-sky-200/70',
    children: [
      { key: 'contractsList', href: '/dashboard/contracts' },
      { key: 'parties', href: '/dashboard/parties' },
      { key: 'foreignContracts', href: '/dashboard/contracts/foreign-summary' },
    ],
  },
  {
    key: 'purchases',
    descKey: 'purchasesDesc',
    icon: ShoppingCart,
    accent: 'text-orange-600',
    soft: 'from-orange-500/15 to-orange-500/5',
    ring: 'ring-orange-200/70',
    children: [
      { key: 'purchaseOrders', href: '/dashboard/purchases' },
      { key: 'companyPurchases', href: '/dashboard/purchases/company' },
      { key: 'purchaseInvoices', href: '/dashboard/purchases/invoices' },
      { key: 'purchaseReturns', href: '/dashboard/purchases/returns' },
    ],
  },
  {
    key: 'warehouses',
    descKey: 'warehousesDesc',
    icon: Warehouse,
    accent: 'text-amber-600',
    soft: 'from-amber-500/15 to-amber-500/5',
    ring: 'ring-amber-200/70',
    children: [
      { key: 'warehousesList', href: '/dashboard/warehouses' },
      { key: 'inventory', href: '/dashboard/inventory' },
      { key: 'transfers', href: '/dashboard/warehouses/transfers' },
      { key: 'tanks', href: '/dashboard/warehouses/tanks' },
      { key: 'stocktake', href: '/dashboard/warehouses/stocktake' },
    ],
  },
  {
    key: 'imports',
    descKey: 'importsDesc',
    icon: Ship,
    accent: 'text-cyan-600',
    soft: 'from-cyan-500/15 to-cyan-500/5',
    ring: 'ring-cyan-200/70',
    children: [
      { key: 'foreignArrivals', href: '/dashboard/foreign-arrivals' },
      { key: 'goodsArrivals', href: '/dashboard/goods-arrivals' },
      { key: 'dieselGydro', href: '/dashboard/shipments/gydro' },
      { key: 'transit', href: '/dashboard/transport/transit' },
    ],
  },
  {
    key: 'sales',
    descKey: 'salesDesc',
    icon: TrendingUp,
    accent: 'text-emerald-600',
    soft: 'from-emerald-500/15 to-emerald-500/5',
    ring: 'ring-emerald-200/70',
    children: [
      { key: 'salesOrders', href: '/dashboard/sales' },
      { key: 'salesInvoices', href: '/dashboard/sales/invoices' },
      { key: 'salesDeliveries', href: '/dashboard/sales/deliveries' },
      { key: 'salesReturns', href: '/dashboard/sales/returns' },
      { key: 'salesResales', href: '/dashboard/sales/resales' },
    ],
  },
  {
    key: 'customers',
    descKey: 'customersDesc',
    icon: Users,
    accent: 'text-violet-600',
    soft: 'from-violet-500/15 to-violet-500/5',
    ring: 'ring-violet-200/70',
    children: [
      { key: 'customersList', href: '/dashboard/customers' },
      { key: 'customersSummary', href: '/dashboard/customers/summary' },
      { key: 'receivablesMatrix', href: '/dashboard/customers/receivables-matrix' },
      { key: 'receivables', href: '/dashboard/finance/receivables' },
    ],
  },
  {
    key: 'representatives',
    descKey: 'representativesDesc',
    icon: Handshake,
    accent: 'text-fuchsia-600',
    soft: 'from-fuchsia-500/15 to-fuchsia-500/5',
    ring: 'ring-fuchsia-200/70',
    children: [{ key: 'representativesList', href: '/dashboard/representatives' }],
  },
  {
    key: 'suppliers',
    descKey: 'suppliersDesc',
    icon: Building2,
    accent: 'text-indigo-600',
    soft: 'from-indigo-500/15 to-indigo-500/5',
    ring: 'ring-indigo-200/70',
    children: [
      { key: 'suppliersList', href: '/dashboard/suppliers' },
      { key: 'payables', href: '/dashboard/finance/payables' },
    ],
  },
  {
    key: 'transport',
    descKey: 'transportDesc',
    icon: Truck,
    accent: 'text-blue-600',
    soft: 'from-blue-500/15 to-blue-500/5',
    ring: 'ring-blue-200/70',
    children: [
      { key: 'wagons', href: '/dashboard/transport/wagons' },
      { key: 'trucks', href: '/dashboard/transport/trucks' },
      { key: 'drivers', href: '/dashboard/transport/drivers' },
      { key: 'transportCompanies', href: '/dashboard/transport/companies' },
      { key: 'customs', href: '/dashboard/transport/customs' },
    ],
  },
  {
    key: 'finance',
    descKey: 'financeDesc',
    icon: Landmark,
    accent: 'text-teal-700',
    soft: 'from-teal-600/15 to-teal-600/5',
    ring: 'ring-teal-200/70',
    children: [
      { key: 'journal', href: '/dashboard/journal' },
      { key: 'balanceSheet', href: '/dashboard/balance-sheet' },
      { key: 'banks', href: '/dashboard/finance/banks' },
      { key: 'cash', href: '/dashboard/finance/cash' },
      { key: 'ledger', href: '/dashboard/finance/ledger' },
      { key: 'entries', href: '/dashboard/finance/entries' },
      { key: 'expenses', href: '/dashboard/finance/expenses' },
      { key: 'profitLoss', href: '/dashboard/profit-loss' },
    ],
  },
  {
    key: 'exchange',
    descKey: 'exchangeDesc',
    icon: DollarSign,
    accent: 'text-lime-700',
    soft: 'from-lime-500/15 to-lime-500/5',
    ring: 'ring-lime-200/70',
    children: [
      { key: 'exchangeHouses', href: '/dashboard/exchange' },
      { key: 'currencies', href: '/dashboard/exchange/currencies' },
      { key: 'rates', href: '/dashboard/exchange/rates' },
    ],
  },
  {
    key: 'hr',
    descKey: 'hrDesc',
    icon: Briefcase,
    accent: 'text-rose-600',
    soft: 'from-rose-500/15 to-rose-500/5',
    ring: 'ring-rose-200/70',
    children: [
      { key: 'employees', href: '/dashboard/hr/employees' },
      { key: 'payroll', href: '/dashboard/hr/payroll' },
      { key: 'attendance', href: '/dashboard/hr/attendance' },
    ],
  },
  {
    key: 'reports',
    descKey: 'reportsDesc',
    icon: BarChart3,
    accent: 'text-cyan-700',
    soft: 'from-cyan-600/15 to-cyan-600/5',
    ring: 'ring-cyan-200/70',
    children: [
      { key: 'reportsCenter', href: '/dashboard/reports' },
      { key: 'executive', href: '/dashboard/reports/executive' },
      { key: 'aging', href: '/dashboard/reports/aging' },
    ],
  },
  {
    key: 'notifications',
    descKey: 'notifications',
    icon: Bell,
    href: '/dashboard/notifications',
    accent: 'text-amber-600',
    soft: 'from-amber-500/15 to-amber-500/5',
    ring: 'ring-amber-200/70',
  },
  {
    key: 'settings',
    descKey: 'settingsDesc',
    icon: Settings,
    accent: 'text-slate-600',
    soft: 'from-slate-500/15 to-slate-500/5',
    ring: 'ring-slate-200/70',
    children: [
      { key: 'settingsHome', href: '/dashboard/settings' },
      { key: 'companies', href: '/dashboard/settings/companies' },
      { key: 'branches', href: '/dashboard/settings/branches' },
      { key: 'products', href: '/dashboard/settings/products' },
      { key: 'users', href: '/dashboard/settings/users' },
      { key: 'roles', href: '/dashboard/settings/roles' },
    ],
  },
];

export function isActivePath(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname === href || pathname.startsWith(href + '/');
}

export function longestActiveChild(children: NavChild[] | undefined, pathname: string) {
  if (!children?.length) return undefined;
  const matches = children.filter(
    (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
  );
  if (!matches.length) return undefined;
  return matches.reduce((best, cur) => (cur.href.length > best.href.length ? cur : best));
}

export function modulePrimaryHref(mod: NavModule) {
  return mod.href ?? mod.children?.[0]?.href ?? '/dashboard';
}
