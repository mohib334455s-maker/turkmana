import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Banknote,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  ClipboardList,
  Clock,
  Coins,
  CreditCard,
  Droplets,
  FileSpreadsheet,
  FileText,
  GitBranch,
  Handshake,
  Hourglass,
  Landmark,
  Layers,
  Package,
  PackageOpen,
  Receipt,
  RotateCcw,
  Scale,
  Settings,
  Shield,
  ShieldCheck,
  Ship,
  ShoppingCart,
  Train,
  TrendingUp,
  Truck,
  Undo2,
  UserCircle,
  UserCog,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react';

export type RouteModuleMeta = {
  navKey: string;
  icon: LucideIcon;
};

/** Exact route → colorful icon theme (nav module key + Lucide icon) */
const exactRoutes: Record<string, RouteModuleMeta> = {
  '/dashboard': { navKey: 'dashboard', icon: BarChart3 },

  '/dashboard/journal': { navKey: 'finance', icon: BookOpen },
  '/dashboard/exchange': { navKey: 'exchange', icon: Banknote },
  '/dashboard/customers/summary': { navKey: 'customers', icon: Layers },
  '/dashboard/profit-loss': { navKey: 'finance', icon: Scale },
  '/dashboard/customers': { navKey: 'customers', icon: Users },
  '/dashboard/representatives': { navKey: 'representatives', icon: Handshake },
  '/dashboard/suppliers': { navKey: 'suppliers', icon: Building2 },
  '/dashboard/warehouses': { navKey: 'warehouses', icon: Warehouse },
  '/dashboard/contracts': { navKey: 'contracts', icon: FileText },
  '/dashboard/contracts/new': { navKey: 'contracts', icon: FileText },
  '/dashboard/parties': { navKey: 'contracts', icon: Boxes },
  '/dashboard/foreign-arrivals': { navKey: 'imports', icon: Ship },
  '/dashboard/goods-arrivals': { navKey: 'imports', icon: PackageOpen },
  '/dashboard/shipments/gydro': { navKey: 'imports', icon: Train },
  '/dashboard/inventory': { navKey: 'warehouses', icon: Package },

  '/dashboard/purchases': { navKey: 'purchases', icon: ShoppingCart },
  '/dashboard/purchases/company': { navKey: 'purchases', icon: ShoppingCart },
  '/dashboard/purchases/invoices': { navKey: 'purchases', icon: Receipt },
  '/dashboard/purchases/returns': { navKey: 'purchases', icon: RotateCcw },

  '/dashboard/contracts/foreign-summary': { navKey: 'contracts', icon: FileSpreadsheet },
  '/dashboard/customers/receivables-matrix': { navKey: 'customers', icon: Layers },
  '/dashboard/balance-sheet': { navKey: 'finance', icon: Scale },

  '/dashboard/sales': { navKey: 'sales', icon: TrendingUp },
  '/dashboard/sales/invoices': { navKey: 'sales', icon: Receipt },
  '/dashboard/sales/deliveries': { navKey: 'sales', icon: Truck },
  '/dashboard/sales/returns': { navKey: 'sales', icon: Undo2 },

  '/dashboard/warehouses/transfers': { navKey: 'warehouses', icon: ArrowLeftRight },
  '/dashboard/warehouses/tanks': { navKey: 'warehouses', icon: Droplets },
  '/dashboard/warehouses/stocktake': { navKey: 'warehouses', icon: ClipboardList },

  '/dashboard/transport/wagons': { navKey: 'transport', icon: Train },
  '/dashboard/transport/trucks': { navKey: 'transport', icon: Truck },
  '/dashboard/transport/transit': { navKey: 'imports', icon: Ship },
  '/dashboard/transport/drivers': { navKey: 'transport', icon: UserCircle },
  '/dashboard/transport/customs': { navKey: 'transport', icon: ShieldCheck },
  '/dashboard/transport/companies': { navKey: 'transport', icon: Building2 },

  '/dashboard/finance/receivables': { navKey: 'customers', icon: Wallet },
  '/dashboard/finance/payables': { navKey: 'suppliers', icon: CreditCard },
  '/dashboard/finance/banks': { navKey: 'finance', icon: Landmark },
  '/dashboard/finance/cash': { navKey: 'finance', icon: Banknote },
  '/dashboard/finance/ledger': { navKey: 'finance', icon: BookOpen },
  '/dashboard/finance/entries': { navKey: 'finance', icon: FileSpreadsheet },
  '/dashboard/finance/expenses': { navKey: 'finance', icon: Receipt },
  '/dashboard/sales/resales': { navKey: 'sales', icon: TrendingUp },

  '/dashboard/hr/employees': { navKey: 'hr', icon: Users },
  '/dashboard/hr/payroll': { navKey: 'hr', icon: Wallet },
  '/dashboard/hr/attendance': { navKey: 'hr', icon: Clock },

  '/dashboard/reports': { navKey: 'reports', icon: BarChart3 },
  '/dashboard/reports/executive': { navKey: 'reports', icon: TrendingUp },
  '/dashboard/reports/aging': { navKey: 'reports', icon: Hourglass },

  '/dashboard/notifications': { navKey: 'notifications', icon: Bell },
  '/dashboard/settings': { navKey: 'settings', icon: Settings },
  '/dashboard/settings/companies': { navKey: 'settings', icon: Building2 },
  '/dashboard/settings/branches': { navKey: 'settings', icon: GitBranch },
  '/dashboard/settings/products': { navKey: 'settings', icon: Package },
  '/dashboard/settings/users': { navKey: 'settings', icon: UserCog },
  '/dashboard/settings/roles': { navKey: 'settings', icon: Shield },
};

type PrefixRule = {
  prefix: string;
  meta: RouteModuleMeta;
  exclude?: string[];
};

const prefixRules: PrefixRule[] = [
  {
    prefix: '/dashboard/customers/',
    meta: { navKey: 'customers', icon: Users },
    exclude: ['/dashboard/customers/summary', '/dashboard/customers/receivables-matrix'],
  },
  { prefix: '/dashboard/suppliers/', meta: { navKey: 'suppliers', icon: Building2 } },
  { prefix: '/dashboard/warehouses/', meta: { navKey: 'warehouses', icon: Warehouse } },
  {
    prefix: '/dashboard/contracts/',
    meta: { navKey: 'contracts', icon: FileText },
    exclude: ['/dashboard/contracts/foreign-summary'],
  },
  { prefix: '/dashboard/exchange/', meta: { navKey: 'exchange', icon: Banknote } },
  { prefix: '/dashboard/goods-arrivals/', meta: { navKey: 'imports', icon: PackageOpen } },
  { prefix: '/dashboard/finance/expenses/', meta: { navKey: 'finance', icon: Receipt } },
];

export function getRouteModuleMeta(pathname: string): RouteModuleMeta | null {
  if (exactRoutes[pathname]) return exactRoutes[pathname];

  for (const rule of prefixRules) {
    if (!pathname.startsWith(rule.prefix)) continue;
    if (rule.exclude?.includes(pathname)) continue;
    return rule.meta;
  }

  return null;
}

/** Report hub cards — distinct accent per link */
export const reportCardThemes: Record<string, string> = {
  '/dashboard/reports/executive': 'reports',
  '/dashboard/reports/aging': 'finance',
  '/dashboard/profit-loss': 'finance',
  '/dashboard/customers/summary': 'customers',
  '/dashboard/inventory': 'warehouses',
  '/dashboard/reports': 'reports',
};
