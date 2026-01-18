import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Vendor } from '../../database/entities/vendor.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, PurchaseOrder])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
