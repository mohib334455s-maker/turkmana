import fs from 'fs';
import path from 'path';

const root = 'd:/turkman/src/app/dashboard';
const pages = [
  ['purchases/page.tsx', 'purchaseOrders'],
  ['purchases/invoices/page.tsx', 'purchaseInvoices'],
  ['purchases/returns/page.tsx', 'purchaseReturns'],
  ['sales/page.tsx', 'salesOrders'],
  ['sales/invoices/page.tsx', 'salesInvoices'],
  ['sales/deliveries/page.tsx', 'salesDeliveries'],
  ['sales/returns/page.tsx', 'salesReturns'],
  ['warehouses/transfers/page.tsx', 'warehouseTransfers'],
  ['warehouses/tanks/page.tsx', 'tanks'],
  ['warehouses/stocktake/page.tsx', 'stocktakes'],
  ['transport/transit/page.tsx', 'transit'],
  ['transport/wagons/page.tsx', 'wagons'],
  ['transport/trucks/page.tsx', 'trucks'],
  ['transport/drivers/page.tsx', 'drivers'],
  ['transport/companies/page.tsx', 'transportCompanies'],
  ['transport/customs/page.tsx', 'customs'],
  ['finance/receivables/page.tsx', 'receivables'],
  ['finance/payables/page.tsx', 'payables'],
  ['finance/banks/page.tsx', 'banks'],
  ['finance/cash/page.tsx', 'cashAccounts'],
  ['finance/ledger/page.tsx', 'ledgerAccounts'],
  ['finance/entries/page.tsx', 'journalVouchers'],
  ['finance/expenses/page.tsx', 'expenses'],
  ['exchange/currencies/page.tsx', 'currencies'],
  ['exchange/rates/page.tsx', 'fxRates'],
  ['hr/employees/page.tsx', 'employees'],
  ['hr/payroll/page.tsx', 'payroll'],
  ['hr/attendance/page.tsx', 'attendance'],
  ['reports/executive/page.tsx', 'executiveReport'],
  ['reports/aging/page.tsx', 'aging'],
  ['settings/companies/page.tsx', 'companies'],
  ['settings/branches/page.tsx', 'branches'],
  ['settings/products/page.tsx', 'settingsProducts'],
  ['settings/users/page.tsx', 'users'],
];

for (const [rel, key] of pages) {
  const file = path.join(root, rel);
  const content = `'use client';

import { CrudPage } from '@/components/shared/crud-page';
import { modules } from '@/lib/modules/catalog';

export default function Page() {
  return <CrudPage {...modules.${key}} />;
}
`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
  console.log('wrote', rel);
}

console.log('done', pages.length);
