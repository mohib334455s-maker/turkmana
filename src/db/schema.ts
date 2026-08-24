import { pgTable, text, serial, integer, timestamp, boolean, decimal, varchar, date, jsonb } from 'drizzle-orm/pg-core';

// Users and Authentication
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('user'), // admin, manager, accountant, user
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Companies (Multi-company support)
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  taxId: varchar('tax_id', { length: 100 }),
  registrationNumber: varchar('registration_number', { length: 100 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Branches
export const branches = pgTable('branches', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Warehouses (Multi-warehouse)
export const warehouses = pgTable('warehouses', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  branchId: integer('branch_id').references(() => branches.id),
  name: varchar('name', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  capacity: decimal('capacity', { precision: 18, scale: 2 }),
  unit: varchar('unit', { length: 50 }),
  type: varchar('type', { length: 100 }), // tank, warehouse, storage
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Currencies
export const currencies = pgTable('currencies', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(), // USD, EUR, AFN, AED, IRR
  symbol: varchar('symbol', { length: 10 }),
  name: varchar('name', { length: 100 }).notNull(),
  nameLocal: varchar('name_local', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Exchange Rates
export const exchangeRates = pgTable('exchange_rates', {
  id: serial('id').primaryKey(),
  fromCurrency: varchar('from_currency', { length: 10 }).references(() => currencies.code).notNull(),
  toCurrency: varchar('to_currency', { length: 10 }).references(() => currencies.code).notNull(),
  rate: decimal('rate', { precision: 18, scale: 6 }).notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products/Items
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  category: varchar('category', { length: 100 }), // diesel, petrol, jet_fuel, oil, gas, etc.
  unit: varchar('unit', { length: 50 }).notNull(), // liter, ton, gallon, kg
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customers
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull().default('customer'), // customer, supplier, both
  taxId: varchar('tax_id', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  contactPerson: varchar('contact_person', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Suppliers
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  country: varchar('country', { length: 100 }),
  taxId: varchar('tax_id', { length: 100 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  contactPerson: varchar('contact_person', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Representatives (نماینده‌ها)
export const representatives = pgTable('representatives', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  region: varchar('region', { length: 255 }),
  address: text('address'),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contracts (قراردادها)
export const contracts = pgTable('contracts', {
  id: serial('id').primaryKey(),
  contractNumber: varchar('contract_number', { length: 100 }).notNull().unique(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  contractDate: date('contract_date').notNull(),
  location: varchar('location', { length: 255 }),
  totalQuantity: decimal('total_quantity', { precision: 18, scale: 3 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 18, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).references(() => currencies.code).notNull(),
  numberOfWagons: integer('number_of_wagons'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, completed, cancelled
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Parties (پارتی‌ها)
export const parties = pgTable('parties', {
  id: serial('id').primaryKey(),
  partyNumber: varchar('party_number', { length: 100 }).notNull().unique(),
  contractId: integer('contract_id').references(() => contracts.id).notNull(),
  unloadLocation: varchar('unload_location', { length: 255 }),
  numberOfWagons: integer('number_of_wagons'),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  arrivalDate: date('arrival_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Foreign Arrivals (وارده‌های خارجی)
export const foreignArrivals = pgTable('foreign_arrivals', {
  id: serial('id').primaryKey(),
  arrivalNumber: varchar('arrival_number', { length: 100 }).notNull().unique(),
  partyId: integer('party_id').references(() => parties.id).notNull(),
  contractId: integer('contract_id').references(() => contracts.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  numberOfWagons: integer('number_of_wagons'),
  initialWeight: decimal('initial_weight', { precision: 18, scale: 3 }),
  unloadedWagons: integer('unloaded_wagons'),
  unloadedWeight: decimal('unloaded_weight', { precision: 18, scale: 3 }),
  shortage: decimal('shortage', { precision: 18, scale: 3 }),
  arrivalLocation: varchar('arrival_location', { length: 255 }),
  arrivalDate: date('arrival_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Goods Arrivals (وارده جنسی)
export const goodsArrivals = pgTable('goods_arrivals', {
  id: serial('id').primaryKey(),
  arrivalNumber: varchar('arrival_number', { length: 100 }).notNull().unique(),
  arrivalDate: date('arrival_date').notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  contractId: integer('contract_id').references(() => contracts.id),
  productId: integer('product_id').references(() => products.id).notNull(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id).notNull(),
  arrivalLocation: varchar('arrival_location', { length: 255 }),
  wagonNumber: varchar('wagon_number', { length: 100 }),
  cmrNumber: varchar('cmr_number', { length: 100 }),
  cmrWeight: decimal('cmr_weight', { precision: 18, scale: 3 }),
  netWeight: decimal('net_weight', { precision: 18, scale: 3 }).notNull(),
  weightDifference: decimal('weight_difference', { precision: 18, scale: 3 }),
  pricePerUnit: decimal('price_per_unit', { precision: 18, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).references(() => currencies.code).notNull(),
  // Expenses
  transportCost: decimal('transport_cost', { precision: 18, scale: 2 }),
  customsCost: decimal('customs_cost', { precision: 18, scale: 2 }),
  serviceCost: decimal('service_cost', { precision: 18, scale: 2 }),
  unloadingCost: decimal('unloading_cost', { precision: 18, scale: 2 }),
  transferCost: decimal('transfer_cost', { precision: 18, scale: 2 }),
  commissionCost: decimal('commission_cost', { precision: 18, scale: 2 }),
  storageCost: decimal('storage_cost', { precision: 18, scale: 2 }),
  weighingCost: decimal('weighing_cost', { precision: 18, scale: 2 }),
  extractionCost: decimal('extraction_cost', { precision: 18, scale: 2 }),
  miscCost: decimal('misc_cost', { precision: 18, scale: 2 }),
  totalExpenses: decimal('total_expenses', { precision: 18, scale: 2 }),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sales Orders
export const salesOrders = pgTable('sales_orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 100 }).notNull().unique(),
  orderDate: date('order_date').notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 18, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).references(() => currencies.code).notNull(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
  deliveryDate: date('delivery_date'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, delivered, cancelled
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  // Resale from another customer's remaining goods
  sourceCustomerId: integer('source_customer_id').references(() => customers.id),
  sourceUnitPrice: decimal('source_unit_price', { precision: 18, scale: 2 }),
  customerLotId: integer('customer_lot_id'),
});

// Deliveries (بارگیری)
export const deliveries = pgTable('deliveries', {
  id: serial('id').primaryKey(),
  deliveryNumber: varchar('delivery_number', { length: 100 }).notNull().unique(),
  deliveryDate: date('delivery_date').notNull(),
  salesOrderId: integer('sales_order_id').references(() => salesOrders.id),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  driverName: varchar('driver_name', { length: 255 }),
  vehiclePlate: varchar('vehicle_plate', { length: 100 }),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Inventory (موجودی انبار)
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull().default('0'),
  reservedQuantity: decimal('reserved_quantity', { precision: 18, scale: 3 }).notNull().default('0'),
  availableQuantity: decimal('available_quantity', { precision: 18, scale: 3 }).notNull().default('0'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Journal Entries (روزنامچه)
export const journalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  entryNumber: varchar('entry_number', { length: 100 }).notNull().unique(),
  entryDate: date('entry_date').notNull(),
  dateJalali: varchar('date_jalali', { length: 32 }),
  dateGregorian: varchar('date_gregorian', { length: 32 }),
  weekday: varchar('weekday', { length: 32 }),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  payer: varchar('payer', { length: 255 }),
  receiver: varchar('receiver', { length: 255 }),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull().default('0'),
  qty: decimal('qty', { precision: 18, scale: 3 }),
  unit: varchar('unit', { length: 30 }),
  currency: varchar('currency', { length: 10 }).references(() => currencies.code).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  balance: decimal('balance', { precision: 18, scale: 2 }),
  customerId: integer('customer_id').references(() => customers.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  exchangeHouseId: integer('exchange_house_id'),
  contractId: integer('contract_id').references(() => contracts.id),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
  markH: boolean('mark_h').notNull().default(false),
  markA: boolean('mark_a').notNull().default(false),
  markN: boolean('mark_n').notNull().default(false),
  markC: boolean('mark_c').notNull().default(false),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Exchange Houses (صرافی‌ها)
export const exchangeHouses = pgTable('exchange_houses', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  whatsapp: varchar('whatsapp', { length: 50 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  address: text('address'),
  // exchanger | joint | treasury — طلب و باقیات فقط روی exchanger جدا گزارش می‌شود
  kind: varchar('kind', { length: 30 }).notNull().default('exchanger'),
  location: varchar('location', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Exchange Transactions (معاملات ارزی)
export const exchangeTransactions = pgTable('exchange_transactions', {
  id: serial('id').primaryKey(),
  transactionNumber: varchar('transaction_number', { length: 100 }).notNull().unique(),
  transactionDate: date('transaction_date').notNull(),
  exchangeHouseId: integer('exchange_house_id').references(() => exchangeHouses.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  transferNumber: varchar('transfer_number', { length: 100 }),
  description: text('description'),
  counterparty: varchar('counterparty', { length: 255 }),
  received: decimal('received', { precision: 18, scale: 2 }),
  paid: decimal('paid', { precision: 18, scale: 2 }),
  currency: varchar('currency', { length: 10 }).references(() => currencies.code).notNull(),
  balance: decimal('balance', { precision: 18, scale: 2 }),
  equivalentAED: decimal('equivalent_aed', { precision: 18, scale: 2 }),
  exchangeRate: decimal('exchange_rate', { precision: 18, scale: 6 }),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Customer Ledger (حساب مشتری)
export const customerLedger = pgTable('customer_ledger', {
  id: serial('id').primaryKey(),
  transactionDate: date('transaction_date').notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  counterparty: varchar('counterparty', { length: 255 }),
  description: text('description'),
  productId: integer('product_id').references(() => products.id),
  quantity: decimal('quantity', { precision: 18, scale: 3 }),
  pricePerUnit: decimal('price_per_unit', { precision: 18, scale: 2 }),
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }),
  deliveryQuantity: decimal('delivery_quantity', { precision: 18, scale: 3 }),
  goodsBalance: decimal('goods_balance', { precision: 18, scale: 3 }),
  cashBalance: decimal('cash_balance', { precision: 18, scale: 2 }),
  warehouseId: integer('warehouse_id').references(() => warehouses.id),
  // purchase | loading | takeback | resale | receipt | payment
  txnType: varchar('txn_type', { length: 50 }).notNull().default('purchase'),
  relatedCustomerId: integer('related_customer_id').references(() => customers.id),
  sourceUnitPrice: decimal('source_unit_price', { precision: 18, scale: 2 }),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Supplier Ledger (حساب تأمین‌کننده)
export const supplierLedger = pgTable('supplier_ledger', {
  id: serial('id').primaryKey(),
  transactionDate: date('transaction_date').notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  counterparty: varchar('counterparty', { length: 255 }),
  description: text('description'),
  contractNumber: varchar('contract_number', { length: 100 }),
  productId: integer('product_id').references(() => products.id),
  location: varchar('location', { length: 255 }),
  purchaseQuantity: decimal('purchase_quantity', { precision: 18, scale: 3 }),
  purchasePrice: decimal('purchase_price', { precision: 18, scale: 2 }),
  loadingQuantity: decimal('loading_quantity', { precision: 18, scale: 3 }),
  goodsBalance: decimal('goods_balance', { precision: 18, scale: 3 }),
  amount: decimal('amount', { precision: 18, scale: 2 }),
  payment: decimal('payment', { precision: 18, scale: 2 }),
  cashBalance: decimal('cash_balance', { precision: 18, scale: 2 }),
  driverName: varchar('driver_name', { length: 255 }),
  vehiclePlate: varchar('vehicle_plate', { length: 100 }),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Profit/Loss Details (جزئیات مفاد و ضرر)
export const profitLossDetails = pgTable('profit_loss_details', {
  id: serial('id').primaryKey(),
  contractId: integer('contract_id').references(() => contracts.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  // Purchase
  purchaseQuantity: decimal('purchase_quantity', { precision: 18, scale: 3 }).notNull(),
  purchaseAmount: decimal('purchase_amount', { precision: 18, scale: 2 }).notNull(),
  avgPurchasePrice: decimal('avg_purchase_price', { precision: 18, scale: 2 }),
  totalCostPrice: decimal('total_cost_price', { precision: 18, scale: 2 }),
  // Foreign Expenses
  foreignTransportCost: decimal('foreign_transport_cost', { precision: 18, scale: 2 }),
  bankCommission: decimal('bank_commission', { precision: 18, scale: 2 }),
  railwayCost: decimal('railway_cost', { precision: 18, scale: 2 }),
  truckCost: decimal('truck_cost', { precision: 18, scale: 2 }),
  storageCostForeign: decimal('storage_cost_foreign', { precision: 18, scale: 2 }),
  foreignCustoms: decimal('foreign_customs', { precision: 18, scale: 2 }),
  loadingCost: decimal('loading_cost', { precision: 18, scale: 2 }),
  penaltyCost: decimal('penalty_cost', { precision: 18, scale: 2 }),
  otherForeignCosts: decimal('other_foreign_costs', { precision: 18, scale: 2 }),
  // Domestic Expenses
  domesticCustoms: decimal('domestic_customs', { precision: 18, scale: 2 }),
  telexCost: decimal('telex_cost', { precision: 18, scale: 2 }),
  landCost: decimal('land_cost', { precision: 18, scale: 2 }),
  domesticRailway: decimal('domestic_railway', { precision: 18, scale: 2 }),
  petroleumServices: decimal('petroleum_services', { precision: 18, scale: 2 }),
  laboratoryCost: decimal('laboratory_cost', { precision: 18, scale: 2 }),
  delayPenalty: decimal('delay_penalty', { precision: 18, scale: 2 }),
  portServices: decimal('port_services', { precision: 18, scale: 2 }),
  domesticTransport: decimal('domestic_transport', { precision: 18, scale: 2 }),
  domesticStorage: decimal('domestic_storage', { precision: 18, scale: 2 }),
  commissionPerLiter: decimal('commission_per_liter', { precision: 18, scale: 2 }),
  weighingFee: decimal('weighing_fee', { precision: 18, scale: 2 }),
  wagonToStorageTransfer: decimal('wagon_to_storage_transfer', { precision: 18, scale: 2 }),
  oilConsumption: decimal('oil_consumption', { precision: 18, scale: 2 }),
  miscExpenses: decimal('misc_expenses', { precision: 18, scale: 2 }),
  contractExpenses: decimal('contract_expenses', { precision: 18, scale: 2 }),
  officeExpenses: decimal('office_expenses', { precision: 18, scale: 2 }),
  // Totals
  totalExpenses: decimal('total_expenses', { precision: 18, scale: 2 }),
  avgCostPerTon: decimal('avg_cost_per_ton', { precision: 18, scale: 2 }),
  // Sales
  salesQuantity: decimal('sales_quantity', { precision: 18, scale: 3 }),
  salesAmount: decimal('sales_amount', { precision: 18, scale: 2 }),
  avgSalesPrice: decimal('avg_sales_price', { precision: 18, scale: 2 }),
  // Profit/Loss
  profitLossPerTon: decimal('profit_loss_per_ton', { precision: 18, scale: 2 }),
  totalProfitLoss: decimal('total_profit_loss', { precision: 18, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Customer goods lots — oil/goods sitting with a customer at the original sale rate.
// Example: 100 t sold to حاجی احمد @ $1300; later 25 t can be taken back and resold.
export const customerGoodsLots = pgTable('customer_goods_lots', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  salesOrderId: integer('sales_order_id').references(() => salesOrders.id),
  qtyOriginal: decimal('qty_original', { precision: 18, scale: 3 }).notNull(),
  qtyRemaining: decimal('qty_remaining', { precision: 18, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull().default('تن'),
  unitPrice: decimal('unit_price', { precision: 18, scale: 2 }).notNull(),
  soldAt: date('sold_at').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Resale of customer-held goods to another customer at a new rate.
export const goodsResales = pgTable('goods_resales', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  sourceLotId: integer('source_lot_id').references(() => customerGoodsLots.id).notNull(),
  sourceCustomerId: integer('source_customer_id').references(() => customers.id).notNull(),
  targetCustomerId: integer('target_customer_id').references(() => customers.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  sourceUnitPrice: decimal('source_unit_price', { precision: 18, scale: 2 }).notNull(),
  resaleUnitPrice: decimal('resale_unit_price', { precision: 18, scale: 2 }).notNull(),
  profitPerUnit: decimal('profit_per_unit', { precision: 18, scale: 2 }).notNull(),
  totalProfit: decimal('total_profit', { precision: 18, scale: 2 }).notNull(),
  resaleDate: date('resale_date').notNull(),
  details: text('details'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Expense books — top-level مصارف summary (کمیشن بانکی، متفرقه، بالای اجناس، ...)
export const expenseBooks = pgTable('expense_books', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  kind: varchar('kind', { length: 30 }).notNull(), // company | goods
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
});

// Goods expense accounts — e.g. مصارف پطرول 92 قرارداد B-035103
export const expenseAccounts = pgTable('expense_accounts', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  bookCode: varchar('book_code', { length: 50 }).notNull().default('goods'),
  code: varchar('code', { length: 100 }),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 255 }),
  productId: integer('product_id').references(() => products.id),
  contractId: integer('contract_id').references(() => contracts.id),
  partyId: integer('party_id').references(() => parties.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Expense payment lines — each clickable total (e.g. ترانسپورت داخلی $20,000) drills into these.
export const expenseEntries = pgTable('expense_entries', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  bookCode: varchar('book_code', { length: 50 }).notNull(),
  accountId: integer('account_id').references(() => expenseAccounts.id),
  entryDate: date('entry_date').notNull(),
  counterparty: varchar('counterparty', { length: 255 }),
  details: text('details'),
  productType: varchar('product_type', { length: 100 }),
  productName: varchar('product_name', { length: 255 }),
  litersPerBottle: decimal('liters_per_bottle', { precision: 18, scale: 3 }),
  bottlesPerCarton: decimal('bottles_per_carton', { precision: 18, scale: 3 }),
  partyLabel: varchar('party_label', { length: 255 }),
  partyId: integer('party_id').references(() => parties.id),
  contractId: integer('contract_id').references(() => contracts.id),
  expenseType: varchar('expense_type', { length: 100 }).notNull(),
  taken: decimal('taken', { precision: 18, scale: 2 }).notNull().default('0'),
  given: decimal('given', { precision: 18, scale: 2 }).notNull().default('0'),
  location: varchar('location', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('ok'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Storage goods movements — unload into / load out of a depot
export const storageGoodsMoves = pgTable('storage_goods_moves', {
  id: serial('id').primaryKey(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  moveDate: date('move_date').notNull(),
  kind: varchar('kind', { length: 20 }).notNull(), // unload | load
  counterparty: varchar('counterparty', { length: 255 }),
  details: text('details'),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productCode: varchar('product_code', { length: 100 }),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull().default('تن'),
  partyLabel: varchar('party_label', { length: 255 }),
  partyId: integer('party_id').references(() => parties.id),
  contractId: integer('contract_id').references(() => contracts.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Storage cash ledger — گرفت / داد / تاریخ ختم کرایه
export const storageCashEntries = pgTable('storage_cash_entries', {
  id: serial('id').primaryKey(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  entryDate: date('entry_date').notNull(),
  rentEndDate: date('rent_end_date'),
  counterparty: varchar('counterparty', { length: 255 }),
  details: text('details'),
  taken: decimal('taken', { precision: 18, scale: 2 }).notNull().default('0'),
  given: decimal('given', { precision: 18, scale: 2 }).notNull().default('0'),
  location: varchar('location', { length: 255 }),
  productType: varchar('product_type', { length: 255 }),
  notes: text('notes'),
  wagonStayId: integer('wagon_stay_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Wagon daily rent while sitting at a storage
export const wagonRentStays = pgTable('wagon_rent_stays', {
  id: serial('id').primaryKey(),
  warehouseId: integer('warehouse_id').references(() => warehouses.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  startDate: date('start_date').notNull(),
  rentEndDate: date('rent_end_date'),
  wagons: integer('wagons').notNull().default(0),
  dailyRatePerWagon: decimal('daily_rate_per_wagon', { precision: 18, scale: 2 }).notNull().default('0'),
  dailyRatePerTon: decimal('daily_rate_per_ton', { precision: 18, scale: 4 }).notNull().default('0'),
  freeDays: integer('free_days').notNull().default(0),
  quantity: decimal('quantity', { precision: 18, scale: 3 }).notNull().default('0'),
  unit: varchar('unit', { length: 50 }).notNull().default('تن'),
  productType: varchar('product_type', { length: 255 }),
  partyLabel: varchar('party_label', { length: 255 }),
  partyId: integer('party_id').references(() => parties.id),
  location: varchar('location', { length: 255 }),
  notes: text('notes'),
  status: varchar('status', { length: 20 }).notNull().default('open'), // open | settled
  settledEntryId: integer('settled_entry_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Activity Log
export const activityLog = pgTable('activity_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  action: varchar('action', { length: 255 }).notNull(),
  entity: varchar('entity', { length: 100 }).notNull(),
  entityId: integer('entity_id'),
  description: text('description'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
