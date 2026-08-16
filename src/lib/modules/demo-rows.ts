import type { CrudRow } from '@/components/shared/crud-page';

export const demoRows = {
  purchaseOrders: [
    { code: 'PO-1404-018', date: '2026-08-02', supplier: 'Gulf Petro FZE', product: 'دیزل', qty: 1200, unitPrice: 1280, amount: 1536000, currency: 'USD', company: 'arya', status: 'approved', notes: 'پارتی اول قرارداد CNT-1404-01' },
    { code: 'PO-1404-019', date: '2026-08-08', supplier: 'Caspian Fuels', product: 'پطرول', qty: 800, unitPrice: 1180, amount: 944000, currency: 'USD', company: 'turkmen', status: 'pending', notes: '' },
    { code: 'PO-1404-020', date: '2026-08-12', supplier: 'Gulf Petro FZE', product: 'LPG', qty: 220, unitPrice: 760, amount: 167200, currency: 'AED', company: 'arya', status: 'draft', notes: '' },
  ],
  purchaseInvoices: [
    { code: 'PINV-24081', poCode: 'PO-1404-018', date: '2026-08-06', dueDate: '2026-09-05', supplier: 'Gulf Petro FZE', product: 'دیزل', qty: 1200, amount: 1536000, paid: 800000, balance: 736000, currency: 'USD', warehouse: 'گدام مرکزی هرات', company: 'arya', status: 'partial', notes: '' },
    { code: 'PINV-24082', poCode: 'PO-1404-019', date: '2026-08-10', dueDate: '2026-08-25', supplier: 'Caspian Fuels', product: 'پطرول', qty: 800, amount: 944000, paid: 0, balance: 944000, currency: 'USD', warehouse: 'گدام ترکمن', company: 'turkmen', status: 'pending', notes: '' },
    { code: 'PINV-24070', poCode: 'PO-1404-011', date: '2026-07-18', dueDate: '2026-08-01', supplier: 'Gulf Petro FZE', product: 'دیزل', qty: 400, amount: 512000, paid: 512000, balance: 0, currency: 'USD', warehouse: 'گدام مرکزی هرات', company: 'arya', status: 'paid', notes: '' },
    { code: 'PINV-24065', poCode: 'PO-1404-008', date: '2026-07-01', dueDate: '2026-07-20', supplier: 'Caspian Fuels', product: 'گاز', qty: 150, amount: 133500, paid: 20000, balance: 113500, currency: 'USD', warehouse: 'تانک شماره ۲', company: 'turkmen', status: 'overdue', notes: 'پیگیری پرداخت' },
  ],
  purchaseReturns: [
    { code: 'PRT-014', invoiceCode: 'PINV-24081', date: '2026-08-09', supplier: 'Gulf Petro FZE', product: 'دیزل', qty: 12, amount: 15360, reason: 'کسری وزن CMR', company: 'arya', status: 'approved', notes: '' },
    { code: 'PRT-015', invoiceCode: 'PINV-24082', date: '2026-08-13', supplier: 'Caspian Fuels', product: 'پطرول', qty: 4, amount: 4720, reason: 'کیفیت پایین', company: 'turkmen', status: 'pending', notes: '' },
  ],
  salesOrders: [
    { code: 'SO-1404-112', date: '2026-08-11', customer: 'احمد تجارتی', product: 'دیزل', qty: 100, unitPrice: 1420, amount: 142000, warehouse: 'گدام مرکزی هرات', company: 'arya', status: 'approved', notes: '' },
    { code: 'SO-1404-113', date: '2026-08-13', customer: 'رضا نفت', product: 'دیزل', qty: 100, unitPrice: 1450, amount: 145000, warehouse: 'گدام مرکزی هرات', company: 'arya', status: 'completed', notes: 'فروش مجدد' },
    { code: 'SO-1404-114', date: '2026-08-14', customer: 'کابل انرژی', product: 'پطرول', qty: 60, unitPrice: 1310, amount: 78600, warehouse: 'گدام ترکمن', company: 'turkmen', status: 'pending', notes: '' },
  ],
  salesInvoices: [
    { code: 'SINV-24091', soCode: 'SO-1404-113', date: '2026-08-13', dueDate: '2026-09-12', customer: 'رضا نفت', product: 'دیزل', qty: 100, amount: 145000, received: 50000, balance: 95000, currency: 'USD', warehouse: 'گدام مرکزی هرات', company: 'arya', status: 'partial', notes: '' },
    { code: 'SINV-24092', soCode: 'SO-1404-112', date: '2026-08-12', dueDate: '2026-08-20', customer: 'احمد تجارتی', product: 'دیزل', qty: 80, amount: 113600, received: 0, balance: 113600, currency: 'USD', warehouse: 'گدام مرکزی هرات', company: 'arya', status: 'pending', notes: '' },
    { code: 'SINV-24080', soCode: 'SO-1404-090', date: '2026-07-22', dueDate: '2026-08-05', customer: 'کابل انرژی', product: 'پطرول', qty: 40, amount: 52400, received: 52400, balance: 0, currency: 'USD', warehouse: 'گدام ترکمن', company: 'turkmen', status: 'paid', notes: '' },
    { code: 'SINV-24071', soCode: 'SO-1404-078', date: '2026-07-02', dueDate: '2026-07-15', customer: 'رضا نفت', product: 'گاز', qty: 30, amount: 29400, received: 5000, balance: 24400, currency: 'USD', warehouse: 'تانک شماره ۲', company: 'turkmen', status: 'overdue', notes: '' },
  ],
  salesDeliveries: [
    { code: 'DLV-331', date: '2026-08-13', customer: 'رضا نفت', product: 'دیزل', qty: 100, warehouse: 'گدام مرکزی هرات', vehicle: 'هرات-۴۴۱۲', driver: 'کریم احمدی', company: 'arya', status: 'delivered', notes: '' },
    { code: 'DLV-332', date: '2026-08-14', customer: 'احمد تجارتی', product: 'دیزل', qty: 40, warehouse: 'گدام مرکزی هرات', vehicle: 'هرات-۲۲۰۱', driver: 'نعمت الله', company: 'arya', status: 'in_transit', notes: '' },
    { code: 'DLV-333', date: '2026-08-14', customer: 'کابل انرژی', product: 'پطرول', qty: 20, warehouse: 'گدام ترکمن', vehicle: 'مزار-118', driver: 'حبیب الرحمن', company: 'turkmen', status: 'pending', notes: '' },
  ],
  salesReturns: [
    { code: 'SRT-021', invoiceCode: 'SINV-24091', date: '2026-08-14', customer: 'رضا نفت', product: 'دیزل', qty: 2, amount: 2900, reason: 'اختلاف وزن باسکول', company: 'arya', status: 'approved', notes: '' },
    { code: 'SRT-022', invoiceCode: 'SINV-24080', date: '2026-07-28', customer: 'کابل انرژی', product: 'پطرول', qty: 1, amount: 1310, reason: 'برگشت جزئی', company: 'turkmen', status: 'completed', notes: '' },
  ],
  warehouseTransfers: [
    { code: 'TR-088', date: '2026-08-10', fromWarehouse: 'گدام مرکزی هرات', toWarehouse: 'تانک شماره ۲', product: 'دیزل', qty: 80, vehicle: 'هرات-۴۴۱۲', company: 'arya', status: 'completed', notes: '' },
    { code: 'TR-089', date: '2026-08-13', fromWarehouse: 'گدام ترکمن', toWarehouse: 'ترانزیت تورغندی', product: 'پطرول', qty: 50, vehicle: 'مزار-118', company: 'turkmen', status: 'pending', notes: '' },
  ],
  tanks: [
    { code: 'TNK-01', name: 'تانک شماره ۱', warehouse: 'گدام مرکزی هرات', product: 'دیزل', capacity: 2500, currentQty: 1680, reserved: 120, company: 'arya', status: 'active', notes: '' },
    { code: 'TNK-02', name: 'تانک شماره ۲', warehouse: 'گدام ترکمن', product: 'پطرول', capacity: 1800, currentQty: 940, reserved: 60, company: 'turkmen', status: 'active', notes: '' },
    { code: 'TNK-03', name: 'تانک گاز', warehouse: 'گدام ترکمن', product: 'گاز', capacity: 600, currentQty: 210, reserved: 0, company: 'turkmen', status: 'holding', notes: 'سرویس دوره‌ای' },
  ],
  stocktakes: [
    { code: 'STK-1404-06', date: '2026-08-01', warehouse: 'گدام مرکزی هرات', product: 'دیزل', systemQty: 1680, countedQty: 1674, diff: -6, countedBy: 'انباردار هرات', company: 'arya', status: 'approved', notes: '' },
    { code: 'STK-1404-07', date: '2026-08-12', warehouse: 'گدام ترکمن', product: 'پطرول', systemQty: 940, countedQty: 940, diff: 0, countedBy: 'انباردار مزار', company: 'turkmen', status: 'pending', notes: '' },
  ],
  transit: [
    { code: 'TRN-441', date: '2026-08-08', origin: 'بندرعباس', destination: 'تورغندی', product: 'دیزل', qty: 620, carrier: 'ریلی آسیا', border: 'اسلام‌قلعه', company: 'arya', status: 'in_transit', notes: '' },
    { code: 'TRN-442', date: '2026-08-11', origin: 'ترکمن‌باشی', destination: 'مزار', product: 'پطرول', qty: 380, carrier: 'کاسپین حمل', border: 'آقینه', company: 'turkmen', status: 'pending', notes: '' },
    { code: 'TRN-430', date: '2026-07-28', origin: 'بندرعباس', destination: 'هرات', product: 'LPG', qty: 90, carrier: 'ریلی آسیا', border: 'اسلام‌قلعه', company: 'arya', status: 'cleared', notes: '' },
  ],
  wagons: [
    { code: 'W-4412', type: 'مخزن‌دار', capacity: 66, product: 'دیزل', qty: 62.4, location: 'اسلام‌قلعه', owner: 'راه‌آهن', company: 'arya', status: 'in_transit', notes: '' },
    { code: 'W-4418', type: 'مخزن‌دار', capacity: 66, product: 'پطرول', qty: 64.1, location: 'آقینه', owner: 'راه‌آهن', company: 'turkmen', status: 'active', notes: '' },
    { code: 'W-3301', type: 'مخزن‌دار', capacity: 60, product: '-', qty: 0, location: 'هرات', owner: 'راه‌آهن', company: 'arya', status: 'holding', notes: '' },
  ],
  trucks: [
    { plate: 'هرات-۴۴۱۲', model: 'ولوو FH', capacity: 28, driver: 'کریم احمدی', transportCompany: 'حمل هرات', currentLoad: 'دیزل', company: 'arya', status: 'in_transit', notes: '' },
    { plate: 'مزار-118', model: 'اسکانیا', capacity: 24, driver: 'حبیب الرحمن', transportCompany: 'کاسپین حمل', currentLoad: 'پطرول', company: 'turkmen', status: 'active', notes: '' },
    { plate: 'هرات-۲۲۰۱', model: 'دانگ‌فنگ', capacity: 20, driver: 'نعمت الله', transportCompany: 'حمل هرات', currentLoad: '-', company: 'arya', status: 'holding', notes: 'تعمیر ترمز' },
  ],
  drivers: [
    { code: 'DRV-01', name: 'کریم احمدی', phone: '0700111222', licenseNo: 'LIC-8821', licenseExpiry: '2027-03-01', vehicle: 'هرات-۴۴۱۲', company: 'arya', status: 'active', notes: '' },
    { code: 'DRV-02', name: 'حبیب الرحمن', phone: '0799333444', licenseNo: 'LIC-7740', licenseExpiry: '2026-12-12', vehicle: 'مزار-118', company: 'turkmen', status: 'active', notes: '' },
    { code: 'DRV-03', name: 'نعمت الله', phone: '0788555666', licenseNo: 'LIC-5512', licenseExpiry: '2026-09-20', vehicle: 'هرات-۲۲۰۱', company: 'arya', status: 'holding', notes: '' },
  ],
  transportCompanies: [
    { code: 'CAR-01', name: 'حمل هرات', phone: '0402223344', contactPerson: 'نجیب الله', vehiclesCount: 18, ratePerTon: 22, company: 'arya', status: 'active', notes: '' },
    { code: 'CAR-02', name: 'کاسپین حمل', phone: '0501112233', contactPerson: 'شیرخان', vehiclesCount: 12, ratePerTon: 24, company: 'turkmen', status: 'active', notes: '' },
  ],
  customs: [
    { code: 'CUS-771', date: '2026-08-09', border: 'اسلام‌قلعه', declarationNo: 'DEC-9981', product: 'دیزل', qty: 620, dutyAmount: 8400, company: 'arya', status: 'cleared', notes: '' },
    { code: 'CUS-772', date: '2026-08-13', border: 'آقینه', declarationNo: 'DEC-9988', product: 'پطرول', qty: 380, dutyAmount: 5100, company: 'turkmen', status: 'pending', notes: '' },
  ],
  receivables: [
    { code: 'AR-091', customer: 'رضا نفت', invoiceCode: 'SINV-24091', date: '2026-08-13', dueDate: '2026-09-12', amount: 145000, received: 50000, balance: 95000, company: 'arya', status: 'partial', notes: '' },
    { code: 'AR-092', customer: 'احمد تجارتی', invoiceCode: 'SINV-24092', date: '2026-08-12', dueDate: '2026-08-20', amount: 113600, received: 0, balance: 113600, company: 'arya', status: 'open', notes: '' },
    { code: 'AR-071', customer: 'رضا نفت', invoiceCode: 'SINV-24071', date: '2026-07-02', dueDate: '2026-07-15', amount: 29400, received: 5000, balance: 24400, company: 'turkmen', status: 'overdue', notes: '' },
  ],
  payables: [
    { code: 'AP-081', supplier: 'Gulf Petro FZE', invoiceCode: 'PINV-24081', date: '2026-08-06', dueDate: '2026-09-05', amount: 1536000, paid: 800000, balance: 736000, company: 'arya', status: 'partial', notes: '' },
    { code: 'AP-082', supplier: 'Caspian Fuels', invoiceCode: 'PINV-24082', date: '2026-08-10', dueDate: '2026-08-25', amount: 944000, paid: 0, balance: 944000, company: 'turkmen', status: 'open', notes: '' },
    { code: 'AP-065', supplier: 'Caspian Fuels', invoiceCode: 'PINV-24065', date: '2026-07-01', dueDate: '2026-07-20', amount: 133500, paid: 20000, balance: 113500, company: 'turkmen', status: 'overdue', notes: '' },
  ],
  banks: [
    { code: 'BNK-USD-01', bankName: 'بانک ملی', accountNo: '001-778821', currency: 'USD', balance: 78000, branch: 'هرات', company: 'arya', status: 'active', notes: '' },
    { code: 'BNK-AFN-01', bankName: 'بانک ملی', accountNo: '001-778830', currency: 'AFN', balance: 2450000, branch: 'هرات', company: 'arya', status: 'active', notes: '' },
    { code: 'BNK-USD-02', bankName: 'عزیزی بانک', accountNo: '220-441190', currency: 'USD', balance: 45000, branch: 'مزار', company: 'turkmen', status: 'active', notes: '' },
  ],
  cashAccounts: [
    { code: 'CASH-01', name: 'صندوق هرات', cashier: 'فرید احمد', currency: 'USD', balance: 24100, location: 'دفتر هرات', company: 'arya', status: 'active', notes: '' },
    { code: 'CASH-02', name: 'صندوق مزار', cashier: 'وحید الله', currency: 'USD', balance: 17100, location: 'دفتر مزار', company: 'turkmen', status: 'active', notes: '' },
  ],
  ledgerAccounts: [
    { code: '1101', name: 'موجودی کالا', type: 'asset', debit: 256480, credit: 0, balance: 256480, company: 'arya', status: 'active', notes: '' },
    { code: '1201', name: 'حسابات دریافتنی', type: 'asset', debit: 184920, credit: 0, balance: 184920, company: 'arya', status: 'active', notes: '' },
    { code: '2101', name: 'حسابات پرداختنی', type: 'liability', debit: 0, credit: 71560, balance: -71560, company: 'arya', status: 'active', notes: '' },
    { code: '4101', name: 'فروش سوخت', type: 'income', debit: 0, credit: 256480, balance: -256480, company: 'both', status: 'active', notes: '' },
  ],
  journalVouchers: [
    { code: 'JV-24081', date: '2026-08-06', description: 'ثبت فاکتور خرید دیزل', debitAccount: '1101 موجودی کالا', creditAccount: '2101 پرداختنی', amount: 1536000, refDoc: 'PINV-24081', company: 'arya', status: 'approved', notes: '' },
    { code: 'JV-24091', date: '2026-08-13', description: 'صدور فاکتور فروش رضا نفت', debitAccount: '1201 دریافتنی', creditAccount: '4101 فروش', amount: 145000, refDoc: 'SINV-24091', company: 'arya', status: 'approved', notes: '' },
    { code: 'JV-24093', date: '2026-08-14', description: 'هزینه حمل هرات', debitAccount: '5101 مصارف حمل', creditAccount: 'CASH-01', amount: 1800, refDoc: 'EXP-044', company: 'arya', status: 'pending', notes: '' },
  ],
  expenses: [
    { code: 'EXP-044', date: '2026-08-14', category: 'transport', title: 'کرایه موتر هرات', amount: 1800, paidFrom: 'صندوق هرات', company: 'arya', status: 'approved', notes: '' },
    { code: 'EXP-045', date: '2026-08-09', category: 'customs', title: 'عوارض اسلام‌قلعه', amount: 8400, paidFrom: 'بانک ملی USD', company: 'arya', status: 'completed', notes: '' },
    { code: 'EXP-046', date: '2026-08-01', category: 'salary', title: 'معاش اسد ۱۴۰۴', amount: 12600, paidFrom: 'بانک ملی AFN', company: 'both', status: 'paid', notes: '' },
  ],
  currencies: [
    { code: 'USD', name: 'US Dollar', nameLocal: 'دالر', symbol: '$', decimalPlaces: 2, status: 'active', notes: 'ارز پایه' },
    { code: 'AFN', name: 'Afghani', nameLocal: 'افغانی', symbol: '؋', decimalPlaces: 0, status: 'active', notes: '' },
    { code: 'AED', name: 'Dirham', nameLocal: 'درهم', symbol: 'د.إ', decimalPlaces: 2, status: 'active', notes: '' },
  ],
  fxRates: [
    { date: '2026-08-14', baseCurrency: 'USD', quoteCurrency: 'AFN', buyRate: 68.4, sellRate: 69.1, source: 'صرافی کابل', status: 'active', notes: '' },
    { date: '2026-08-14', baseCurrency: 'USD', quoteCurrency: 'AED', buyRate: 3.66, sellRate: 3.68, source: 'صرافی دبی', status: 'active', notes: '' },
    { date: '2026-08-13', baseCurrency: 'USD', quoteCurrency: 'AFN', buyRate: 68.2, sellRate: 68.9, source: 'صرافی کابل', status: 'inactive', notes: '' },
  ],
  employees: [
    { code: 'EMP-01', name: 'فرید احمد', role: 'صندوق‌دار', department: 'مالی', phone: '0700111000', salary: 850, hireDate: '2022-03-01', company: 'arya', status: 'active', notes: '' },
    { code: 'EMP-02', name: 'وحید الله', role: 'انباردار', department: 'گدام', phone: '0799222000', salary: 720, hireDate: '2023-06-12', company: 'turkmen', status: 'active', notes: '' },
    { code: 'EMP-03', name: 'لیلا محمدی', role: 'حسابدار', department: 'مالی', phone: '0788333000', salary: 980, hireDate: '2021-11-04', company: 'arya', status: 'active', notes: '' },
  ],
  payroll: [
    { code: 'PAY-1404-05', month: 'اسد ۱۴۰۴', employee: 'فرید احمد', baseSalary: 850, allowance: 80, deduction: 20, net: 910, company: 'arya', status: 'paid', notes: '' },
    { code: 'PAY-1404-05b', month: 'اسد ۱۴۰۴', employee: 'وحید الله', baseSalary: 720, allowance: 40, deduction: 0, net: 760, company: 'turkmen', status: 'approved', notes: '' },
    { code: 'PAY-1404-06', month: 'سنبله ۱۴۰۴', employee: 'لیلا محمدی', baseSalary: 980, allowance: 100, deduction: 30, net: 1050, company: 'arya', status: 'draft', notes: '' },
  ],
  attendance: [
    { date: '2026-08-14', employee: 'فرید احمد', checkIn: '08:05', checkOut: '17:10', workHours: 8.5, type: 'present', company: 'arya', status: 'approved', notes: '' },
    { date: '2026-08-14', employee: 'وحید الله', checkIn: '08:20', checkOut: '16:50', workHours: 8, type: 'present', company: 'turkmen', status: 'approved', notes: '' },
    { date: '2026-08-13', employee: 'لیلا محمدی', checkIn: '-', checkOut: '-', workHours: 0, type: 'leave', company: 'arya', status: 'pending', notes: 'مرخصی استحقاقی' },
  ],
  documents: [
    { code: 'DOC-441', title: 'قرارداد CNT-1404-01', category: 'contract', relatedTo: 'Gulf Petro FZE', date: '2026-07-01', fileName: 'cnt-1404-01.pdf', company: 'arya', status: 'active', notes: '' },
    { code: 'DOC-442', title: 'فاکتور PINV-24081', category: 'invoice', relatedTo: 'Gulf Petro FZE', date: '2026-08-06', fileName: 'pinv-24081.pdf', company: 'arya', status: 'active', notes: '' },
    { code: 'DOC-443', title: 'اظهارنامه DEC-9981', category: 'customs', relatedTo: 'اسلام‌قلعه', date: '2026-08-09', fileName: 'dec-9981.pdf', company: 'arya', status: 'archived', notes: '' },
  ],
  guarantees: [
    { code: 'GRN-12', bank: 'بانک ملی', beneficiary: 'گمرک هرات', amount: 50000, issueDate: '2026-03-01', expireDate: '2027-03-01', relatedContract: 'CNT-1404-01', company: 'arya', status: 'active', notes: '' },
    { code: 'GRN-13', bank: 'عزیزی بانک', beneficiary: 'Caspian Fuels', amount: 25000, issueDate: '2026-06-10', expireDate: '2026-12-10', relatedContract: 'CNT-1404-02', company: 'turkmen', status: 'pending', notes: '' },
  ],
  executiveReport: [
    { kpi: 'ارزش موجودی', period: 'اسد ۱۴۰۴', value: 256480, unit: 'USD', changePct: 8.4, owner: 'مدیر سیستم', company: 'both', status: 'active', notes: '' },
    { kpi: 'بیلانس مشتریان', period: 'اسد ۱۴۰۴', value: 184920, unit: 'USD', changePct: 6.1, owner: 'حسابدار', company: 'both', status: 'active', notes: '' },
    { kpi: 'مفاد و ضرر', period: 'اسد ۱۴۰۴', value: 18420, unit: 'USD', changePct: -2.1, owner: 'مدیر عملیات', company: 'both', status: 'pending', notes: '' },
  ],
  aging: [
    { party: 'رضا نفت', type: 'receivable', current: 95000, d1_30: 0, d31_60: 0, d61_90: 0, over90: 0, total: 95000, company: 'arya', status: 'open', notes: '' },
    { party: 'احمد تجارتی', type: 'receivable', current: 0, d1_30: 113600, d31_60: 0, d61_90: 0, over90: 0, total: 113600, company: 'arya', status: 'open', notes: '' },
    { party: 'Caspian Fuels', type: 'payable', current: 0, d1_30: 944000, d31_60: 0, d61_90: 113500, over90: 0, total: 1057500, company: 'turkmen', status: 'overdue', notes: '' },
  ],
  companies: [
    { code: 'ARYA', name: 'آریا', nameEn: 'Arya', taxId: 'TAX-1001', phone: '0402001000', address: 'هرات', status: 'active', notes: '' },
    { code: 'TKMN', name: 'ترکمن', nameEn: 'Turkmen', taxId: 'TAX-1002', phone: '0502001000', address: 'مزار شریف', status: 'active', notes: '' },
  ],
  branches: [
    { code: 'BR-HRT', name: 'شعبه هرات', city: 'هرات', manager: 'مدیر سیستم', phone: '0402001001', company: 'arya', status: 'active', notes: '' },
    { code: 'BR-MZR', name: 'شعبه مزار', city: 'مزار شریف', manager: 'وحید الله', phone: '0502001001', company: 'turkmen', status: 'active', notes: '' },
  ],
  settingsProducts: [
    { code: 'DIESEL', name: 'دیزل', nameEn: 'Diesel', category: 'fuel', unit: 'تن', stdPrice: 1280, status: 'active', notes: '' },
    { code: 'DIESEL-GYDRO', name: 'دیزل گیدرو', nameEn: 'Gydro diesel', category: 'fuel', unit: 'تن', stdPrice: 1280, status: 'active', notes: '' },
    { code: 'PETROL-92', name: 'پطرول ۹۲', nameEn: 'Petrol 92', category: 'fuel', unit: 'تن', stdPrice: 1210, status: 'active', notes: '' },
    { code: 'GAS', name: 'گاز', nameEn: 'Gas', category: 'fuel', unit: 'تن', stdPrice: 890, status: 'active', notes: '' },
    { code: 'JET-TC1', name: 'تیل طیاره TC-1', nameEn: 'Jet fuel TC-1', category: 'fuel', unit: 'تن', stdPrice: 1460, status: 'active', notes: '' },
    { code: 'SUGAR', name: 'شکر', nameEn: 'Sugar', category: 'food', unit: 'تن', stdPrice: 620, status: 'active', notes: '' },
    { code: 'WHEAT', name: 'گندم', nameEn: 'Wheat', category: 'food', unit: 'تن', stdPrice: 380, status: 'active', notes: '' },
    { code: 'FLOUR', name: 'آرد', nameEn: 'Flour', category: 'food', unit: 'تن', stdPrice: 410, status: 'active', notes: '' },
    { code: 'RICE', name: 'برنج', nameEn: 'Rice', category: 'food', unit: 'تن', stdPrice: 540, status: 'active', notes: '' },
    { code: 'OIL', name: 'روغن', nameEn: 'Edible oil', category: 'food', unit: 'تن', stdPrice: 980, status: 'active', notes: '' },
    { code: 'CORN', name: 'جواری', nameEn: 'Corn', category: 'food', unit: 'تن', stdPrice: 290, status: 'active', notes: '' },
    { code: 'TEA', name: 'چای', nameEn: 'Tea', category: 'food', unit: 'تن', stdPrice: 2100, status: 'active', notes: '' },
    { code: 'FERT', name: 'کود کیمیاوی', nameEn: 'Fertilizer', category: 'other', unit: 'تن', stdPrice: 340, status: 'active', notes: '' },
  ],
  users: [
    { email: 'admin@example.com', fullName: 'مدیر سیستم', phone: '0700000001', lastLogin: '2026-08-14 07:40', status: 'active', role: 'admin', companyAccess: 'both', notes: 'دسترسی هر دو شرکت' },
    { email: 'arya@example.com', fullName: 'کاربر آریا', phone: '0700000010', lastLogin: '2026-08-14 08:00', status: 'active', role: 'manager', companyAccess: 'arya', notes: '' },
    { email: 'turkmen@example.com', fullName: 'کاربر ترکمن', phone: '0700000011', lastLogin: '2026-08-14 08:10', status: 'active', role: 'manager', companyAccess: 'turkmen', notes: '' },
    { email: 'ops@turkman.local', fullName: 'مدیر عملیات', phone: '0700000002', lastLogin: '2026-08-13 18:12', status: 'active', role: 'manager', companyAccess: 'both', notes: 'با تأیید ادمین' },
    { email: 'acc@turkman.local', fullName: 'لیلا محمدی', phone: '0788333000', lastLogin: '2026-08-14 09:05', status: 'active', role: 'accountant', companyAccess: 'arya', notes: '' },
    { email: 'wh@turkman.local', fullName: 'وحید الله', phone: '0799222000', lastLogin: '2026-08-12 11:20', status: 'active', role: 'warehouse', companyAccess: 'turkmen', notes: '' },
    { email: 'sales@turkman.local', fullName: 'کریم احمدی', phone: '0700111222', lastLogin: '2026-08-11 16:40', status: 'active', role: 'sales', companyAccess: 'arya', notes: '' },
    { email: 'user@turkman.local', fullName: 'کاربر عملیاتی', phone: '0700000099', lastLogin: '2026-08-10 10:00', status: 'active', role: 'user', companyAccess: 'turkmen', notes: '' },
  ],
} satisfies Record<string, CrudRow[]>;
