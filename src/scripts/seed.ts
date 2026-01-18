import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Vendor, VendorStatus, PaymentTerms } from '../database/entities/vendor.entity';
import { PurchaseOrder, POStatus } from '../database/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../database/entities/purchase-order-item.entity';
import { Payment, PaymentMethod } from '../database/entities/payment.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    await dataSource.getRepository(Payment).delete({});
    await dataSource.getRepository(PurchaseOrderItem).delete({});
    await dataSource.getRepository(PurchaseOrder).delete({});
    await dataSource.getRepository(Vendor).delete({});

    console.log('✅ Cleared existing data');

    // Create 5 vendors
    const vendors = await dataSource.getRepository(Vendor).save([
      {
        name: 'ABC Manufacturing Ltd',
        contactPerson: 'Rajesh Kumar',
        email: 'rajesh@abcmfg.com',
        phone: '+91-9876543210',
        paymentTerms: PaymentTerms.THIRTY_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'XYZ Steel Industries',
        contactPerson: 'Priya Sharma',
        email: 'priya@xyzsteel.com',
        phone: '+91-9876543211',
        paymentTerms: PaymentTerms.FORTYFIVE_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'Global Suppliers Inc',
        contactPerson: 'Mohammed Ali',
        email: 'ali@globalsuppliers.com',
        phone: '+91-9876543212',
        paymentTerms: PaymentTerms.FIFTEEN_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'Prime Components Pvt Ltd',
        contactPerson: 'Sunita Patel',
        email: 'sunita@primecomponents.com',
        phone: '+91-9876543213',
        paymentTerms: PaymentTerms.SIXTY_DAYS,
        status: VendorStatus.ACTIVE,
      },
      {
        name: 'Elite Materials Co',
        contactPerson: 'Amit Singh',
        email: 'amit@elitematerials.com',
        phone: '+91-9876543214',
        paymentTerms: PaymentTerms.THIRTY_DAYS,
        status: VendorStatus.INACTIVE,
      },
    ]);

    console.log(`✅ Created ${vendors.length} vendors`);

    // Create 15 purchase orders
    const purchaseOrders: PurchaseOrder[] = [];
    const poData = [
      { vendorIdx: 0, items: [{ desc: 'Steel Rods - Grade A', qty: 100, price: 250.50 }], status: POStatus.APPROVED, daysAgo: 45 },
      { vendorIdx: 0, items: [{ desc: 'Metal Sheets', qty: 50, price: 500.00 }], status: POStatus.PARTIALLY_PAID, daysAgo: 30 },
      { vendorIdx: 0, items: [{ desc: 'Bolts and Nuts Set', qty: 200, price: 15.75 }], status: POStatus.FULLY_PAID, daysAgo: 60 },
      { vendorIdx: 1, items: [{ desc: 'Structural Steel Beams', qty: 25, price: 1200.00 }], status: POStatus.APPROVED, daysAgo: 50 },
      { vendorIdx: 1, items: [{ desc: 'Steel Plates', qty: 40, price: 800.00 }], status: POStatus.PARTIALLY_PAID, daysAgo: 35 },
      { vendorIdx: 1, items: [{ desc: 'Reinforcement Bars', qty: 150, price: 180.00 }], status: POStatus.DRAFT, daysAgo: 10 },
      { vendorIdx: 2, items: [{ desc: 'Electrical Components', qty: 300, price: 45.00 }], status: POStatus.APPROVED, daysAgo: 25 },
      { vendorIdx: 2, items: [{ desc: 'Wire Cables', qty: 500, price: 12.50 }], status: POStatus.FULLY_PAID, daysAgo: 40 },
      { vendorIdx: 2, items: [{ desc: 'Circuit Breakers', qty: 80, price: 220.00 }], status: POStatus.PARTIALLY_PAID, daysAgo: 20 },
      { vendorIdx: 3, items: [{ desc: 'Hydraulic Pumps', qty: 15, price: 3500.00 }], status: POStatus.APPROVED, daysAgo: 55 },
      { vendorIdx: 3, items: [{ desc: 'Pneumatic Cylinders', qty: 30, price: 1800.00 }], status: POStatus.DRAFT, daysAgo: 5 },
      { vendorIdx: 3, items: [{ desc: 'Valves and Fittings', qty: 120, price: 95.00 }], status: POStatus.PARTIALLY_PAID, daysAgo: 42 },
      { vendorIdx: 0, items: [
        { desc: 'Premium Steel Grade B', qty: 75, price: 320.00 },
        { desc: 'Aluminum Sheets', qty: 60, price: 280.00 }
      ], status: POStatus.APPROVED, daysAgo: 28 },
      { vendorIdx: 1, items: [
        { desc: 'Heavy Duty Beams', qty: 20, price: 1500.00 },
        { desc: 'Support Columns', qty: 35, price: 950.00 }
      ], status: POStatus.PARTIALLY_PAID, daysAgo: 38 },
      { vendorIdx: 2, items: [
        { desc: 'LED Light Fixtures', qty: 200, price: 65.00 },
        { desc: 'Power Adapters', qty: 150, price: 35.00 }
      ], status: POStatus.APPROVED, daysAgo: 15 },
    ];

    for (let i = 0; i < poData.length; i++) {
      const data = poData[i];
      const vendor = vendors[data.vendorIdx];
      
      const poDate = new Date();
      poDate.setDate(poDate.getDate() - data.daysAgo);
      
      const dueDate = new Date(poDate);
      dueDate.setDate(dueDate.getDate() + vendor.paymentTerms);

      const items = data.items.map(item => {
        const poItem = new PurchaseOrderItem();
        poItem.description = item.desc;
        poItem.quantity = item.qty;
        poItem.unitPrice = item.price;
        poItem.lineTotal = item.qty * item.price;
        return poItem;
      });

      const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

      const dateStr = poDate.toISOString().slice(0, 10).replace(/-/g, '');
      const sequence = String(i + 1).padStart(3, '0');

      const po = dataSource.getRepository(PurchaseOrder).create({
        poNumber: `PO-${dateStr}-${sequence}`,
        vendorId: vendor.id,
        poDate,
        totalAmount,
        dueDate,
        status: data.status,
        items,
      });

      purchaseOrders.push(await dataSource.getRepository(PurchaseOrder).save(po));
    }

    console.log(`✅ Created ${purchaseOrders.length} purchase orders`);

    // Create 10 payments
    const payments: Payment[] = [];
    const paymentData = [
      { poIdx: 1, amount: 15000, method: PaymentMethod.NEFT, daysAgo: 25 },
      { poIdx: 2, amount: 3150, method: PaymentMethod.UPI, daysAgo: 50 },
      { poIdx: 4, amount: 20000, method: PaymentMethod.RTGS, daysAgo: 30 },
      { poIdx: 7, amount: 6250, method: PaymentMethod.NEFT, daysAgo: 35 },
      { poIdx: 8, amount: 10000, method: PaymentMethod.CHEQUE, daysAgo: 15 },
      { poIdx: 11, amount: 5000, method: PaymentMethod.UPI, daysAgo: 38 },
      { poIdx: 13, amount: 40000, method: PaymentMethod.RTGS, daysAgo: 32 },
      { poIdx: 1, amount: 10000, method: PaymentMethod.NEFT, daysAgo: 15 },
      { poIdx: 4, amount: 12000, method: PaymentMethod.UPI, daysAgo: 20 },
      { poIdx: 11, amount: 6400, method: PaymentMethod.CHEQUE, daysAgo: 28 },
    ];

    for (let i = 0; i < paymentData.length; i++) {
      const data = paymentData[i];
      const po = purchaseOrders[data.poIdx];

      const paymentDate = new Date();
      paymentDate.setDate(paymentDate.getDate() - data.daysAgo);

      const dateStr = paymentDate.toISOString().slice(0, 10).replace(/-/g, '');
      const sequence = String(i + 1).padStart(3, '0');

      const payment = dataSource.getRepository(Payment).create({
        paymentReference: `PAY-${dateStr}-${sequence}`,
        purchaseOrderId: po.id,
        paymentDate,
        amount: data.amount,
        paymentMethod: data.method,
        notes: `Payment for ${po.poNumber}`,
      });

      payments.push(await dataSource.getRepository(Payment).save(payment));
    }

    console.log(`✅ Created ${payments.length} payments`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
    Summary:
    - ${vendors.length} Vendors
    - ${purchaseOrders.length} Purchase Orders
    - ${payments.length} Payments
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seed();
