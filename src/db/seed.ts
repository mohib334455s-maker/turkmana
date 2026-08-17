import { db } from './index';
import { users, companies, currencies, products } from './schema';
import { hashPassword } from '@/lib/auth';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create default admin user
    const hashedPassword = await hashPassword('aria1234');
    
    await db.insert(users).values({
      email: 'turkman',
      password: hashedPassword,
      fullName: 'مدیر ترکمن',
      role: 'admin',
      isActive: true,
    }).onConflictDoNothing();

    console.log('✅ Admin user created');

    // Create default companies
    await db.insert(companies).values([
      {
        name: 'شرکت بازرگانی پارس',
        nameEn: 'Pars Trading Company',
        taxId: 'TAX-001',
        registrationNumber: 'REG-001',
        isActive: true,
      },
      {
        name: 'شرکت نفت خلیج',
        nameEn: 'Gulf Oil Company',
        taxId: 'TAX-002',
        registrationNumber: 'REG-002',
        isActive: true,
      },
    ]).onConflictDoNothing();

    console.log('✅ Companies created');

    // Create currencies
    await db.insert(currencies).values([
      { code: 'USD', symbol: '$', name: 'US Dollar', nameLocal: 'دلار آمریکا', isActive: true },
      { code: 'EUR', symbol: '€', name: 'Euro', nameLocal: 'یورو', isActive: true },
      { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', nameLocal: 'درهم امارات', isActive: true },
      { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', nameLocal: 'افغانی', isActive: true },
      { code: 'IRR', symbol: '﷼', name: 'Iranian Rial', nameLocal: 'ریال ایران', isActive: true },
    ]).onConflictDoNothing();

    console.log('✅ Currencies created');

    // Create products
    await db.insert(products).values([
      { code: 'DIESEL', name: 'دیزل', nameEn: 'Diesel', category: 'fuel', unit: 'ton', isActive: true },
      { code: 'DIESEL-LS', name: 'دیزل کم‌گوگرد', nameEn: 'Low Sulfur Diesel', category: 'fuel', unit: 'ton', isActive: true },
      { code: 'PETROL', name: 'پترول', nameEn: 'Petrol', category: 'fuel', unit: 'ton', isActive: true },
      { code: 'PETROL-92', name: 'پترول 92', nameEn: 'Petrol 92', category: 'fuel', unit: 'ton', isActive: true },
      { code: 'GAS', name: 'گاز', nameEn: 'Gas', category: 'fuel', unit: 'ton', isActive: true },
      { code: 'LPG', name: 'گاز مایع', nameEn: 'LPG', category: 'fuel', unit: 'ton', isActive: true },
      { code: 'JET-FUEL', name: 'سوخت جت', nameEn: 'Jet Fuel', category: 'fuel', unit: 'ton', isActive: true },
      { code: 'OIL', name: 'روغن', nameEn: 'Oil', category: 'oil', unit: 'ton', isActive: true },
    ]).onConflictDoNothing();

    console.log('✅ Products created');

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
