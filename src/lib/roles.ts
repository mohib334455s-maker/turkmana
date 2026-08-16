import type { UserRole } from '@/lib/auth-store';

export type RoleDef = {
  key: UserRole;
  titleFa: string;
  titleEn: string;
  accessFa: string;
  accessEn: string;
  users: number;
};

export const systemRoles: RoleDef[] = [
  {
    key: 'admin',
    titleFa: 'مدیر سیستم',
    titleEn: 'System admin',
    accessFa: 'دسترسی کامل به همه ماژول‌ها، کاربران و نقش‌ها',
    accessEn: 'Full access to all modules, users and roles',
    users: 1,
  },
  {
    key: 'manager',
    titleFa: 'مدیر عملیات',
    titleEn: 'Operations manager',
    accessFa: 'قرارداد، خرید، فروش، گدام و گزارش‌ها — مدیریت کاربران',
    accessEn: 'Contracts, purchase, sales, warehouse, reports, and user management',
    users: 1,
  },
  {
    key: 'accountant',
    titleFa: 'حسابدار',
    titleEn: 'Accountant',
    accessFa: 'مالی، صرافی، فاکتورها، مطالبات و گزارش اجرایی',
    accessEn: 'Finance, exchange, invoices, receivables and executive reports',
    users: 1,
  },
  {
    key: 'warehouse',
    titleFa: 'انباردار',
    titleEn: 'Warehouse keeper',
    accessFa: 'گدام، موجودی، وارده، انتقال و انبارگردانی',
    accessEn: 'Warehouse, inventory, arrivals, transfers and stocktake',
    users: 1,
  },
  {
    key: 'sales',
    titleFa: 'فروش',
    titleEn: 'Sales',
    accessFa: 'مشتریان، سفارش و فاکتور فروش، بارگیری',
    accessEn: 'Customers, sales orders/invoices and deliveries',
    users: 1,
  },
  {
    key: 'user',
    titleFa: 'کاربر',
    titleEn: 'User',
    accessFa: 'مشاهده داشبورد و عملیات روزمره — بدون تنظیمات کاربران',
    accessEn: 'Dashboard and daily operations — no user/role settings',
    users: 1,
  },
];
