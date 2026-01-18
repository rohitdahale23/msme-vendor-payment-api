import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from '../../database/entities/vendor.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { VendorOutstandingDto } from './dto/vendor-outstanding.dto';
import { PaymentAgingDto, AgingBucketDto } from './dto/payment-aging.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepository: Repository<PurchaseOrder>,
  ) {}

  async getVendorOutstanding(): Promise<VendorOutstandingDto[]> {
    const vendors = await this.vendorRepository.find({
      where: { deletedAt: null },
      relations: ['purchaseOrders', 'purchaseOrders.payments'],
    });

    const outstandingData: VendorOutstandingDto[] = vendors.map(vendor => {
      let totalPOAmount = 0;
      let totalPaid = 0;
      let totalPurchaseOrders = 0;

      vendor.purchaseOrders.forEach(po => {
        if (!po.deletedAt) {
          totalPurchaseOrders++;
          totalPOAmount += Number(po.totalAmount);

          if (po.payments) {
            po.payments.forEach(payment => {
              if (!payment.deletedAt) {
                totalPaid += Number(payment.amount);
              }
            });
          }
        }
      });

      return {
        vendorId: vendor.id,
        vendorName: vendor.name,
        totalPurchaseOrders,
        totalPOAmount,
        totalPaid,
        outstanding: totalPOAmount - totalPaid,
      };
    });

    // Sort by outstanding amount descending
    return outstandingData.sort((a, b) => b.outstanding - a.outstanding);
  }

  async getPaymentAging(): Promise<PaymentAgingDto> {
    const purchaseOrders = await this.poRepository.find({
      where: { deletedAt: null },
      relations: ['payments'],
    });

    const today = new Date();
    const buckets = {
      '0-30 days': { count: 0, amount: 0 },
      '31-60 days': { count: 0, amount: 0 },
      '61-90 days': { count: 0, amount: 0 },
      '90+ days': { count: 0, amount: 0 },
    };

    let totalOverdue = 0;
    let totalOverdueCount = 0;

    purchaseOrders.forEach(po => {
      const totalPaid = po.payments
        .filter(p => !p.deletedAt)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const outstanding = Number(po.totalAmount) - totalPaid;

      if (outstanding > 0) {
        const dueDate = new Date(po.dueDate);
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          // Overdue
          totalOverdue += outstanding;
          totalOverdueCount++;

          if (diffDays <= 30) {
            buckets['0-30 days'].count++;
            buckets['0-30 days'].amount += outstanding;
          } else if (diffDays <= 60) {
            buckets['31-60 days'].count++;
            buckets['31-60 days'].amount += outstanding;
          } else if (diffDays <= 90) {
            buckets['61-90 days'].count++;
            buckets['61-90 days'].amount += outstanding;
          } else {
            buckets['90+ days'].count++;
            buckets['90+ days'].amount += outstanding;
          }
        }
      }
    });

    const aging: AgingBucketDto[] = Object.entries(buckets).map(([bucket, data]) => ({
      bucket,
      count: data.count,
      amount: data.amount,
    }));

    return {
      aging,
      totalOverdue,
      totalOverdueCount,
    };
  }
}
