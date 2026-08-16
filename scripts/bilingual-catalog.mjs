import fs from 'fs';

const path = 'd:/turkman/src/lib/modules/catalog.ts';
let s = fs.readFileSync(path, 'utf8');

const map = {
  'پیش‌نویس': 'Draft',
  'در انتظار': 'Pending',
  'تأیید شده': 'Approved',
  'تکمیل': 'Completed',
  'لغو': 'Cancelled',
  'باز': 'Open',
  'پرداخت‌شده': 'Paid',
  'جزئی': 'Partial',
  'سررسید گذشته': 'Overdue',
  'تحویل‌شده': 'Delivered',
  'در مسیر': 'In transit',
  'فعال': 'Active',
  'غیرفعال': 'Inactive',
  'ترخیص‌شده': 'Cleared',
  'نگهداری': 'Holding',
  'آرشیو': 'Archived',
  'آریا': 'Arya',
  'ترکمن': 'Turkmen',
  'هر دو': 'Both',
  'شرکت': 'Company',
  'وضعیت': 'Status',
  'ملاحظات': 'Notes',
  'ایمیل': 'Email',
  'نام کامل': 'Full name',
  'تلفن': 'Phone',
  'آخرین ورود': 'Last login',
  'کد': 'Code',
  'نام': 'Name',
  'تاریخ': 'Date',
  'مبلغ': 'Amount',
  'مقدار': 'Quantity',
  'کالا': 'Product',
  'مشتری': 'Customer',
  'تأمین‌کننده': 'Supplier',
  'سفارش خرید': 'Purchase orders',
  'فاکتور خرید': 'Purchase invoices',
  'برگشت خرید': 'Purchase returns',
  'سفارش فروش': 'Sales orders',
  'فاکتور فروش': 'Sales invoices',
  'حواله خروج': 'Delivery note',
  'برگشت فروش': 'Sales returns',
  'انتقال': 'Transfer',
  'مخزن': 'Tank',
  'انبارگردانی': 'Stocktake',
  'ترانزیت': 'Transit',
  'واگن': 'Wagon',
  'موتر': 'Truck',
  'راننده': 'Driver',
  'شرکت حمل': 'Carrier',
  'پرونده گمرک': 'Customs case',
  'طلب': 'Receivable',
  'بدهی': 'Payable',
  'حساب بانکی': 'Bank account',
  'صندوق': 'Cash box',
  'حساب': 'Account',
  'سند': 'Voucher',
  'مصرف': 'Expense',
  'ارز': 'Currency',
  'نرخ ارز': 'FX rate',
  'کارمند': 'Employee',
  'فیش معاش': 'Payslip',
  'حضور': 'Attendance',
  'ضمانت‌نامه': 'Guarantee',
  'شاخص': 'KPI',
  'ردیف سررسید': 'Aging row',
  'شعبه': 'Branch',
  'کاربر': 'User',
  'کاربران': 'Users',
};

s = s.replace(/(title|description|entityName|label|placeholder): '([^']+)'/g, (m, key, fa) => {
  if (fa.includes('|')) return m;
  const en = map[fa];
  if (!en) return m;
  return `${key}: '${fa}|${en}'`;
});

fs.writeFileSync(path, s);
console.log('updated bilingual catalog strings');
