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
  companyId: integer('company_id').references(() => companies.id).notNull(),
  payer: varchar('payer', { length: 255 }),
  receiver: varchar('receiver', { length: 255 }),
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 18, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).references(() => currencies.code).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // receipt, payment, transfer
  balance: decimal('balance', { precision: 18, scale: 2 }),
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
  address: text('address'),
  isActive: boolean('is_active').notNull().default(true),
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
