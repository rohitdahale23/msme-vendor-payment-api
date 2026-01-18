import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { VendorOutstandingDto } from './dto/vendor-outstanding.dto';
import { PaymentAgingDto } from './dto/payment-aging.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('vendor-outstanding')
  @ApiOperation({ summary: 'Get outstanding balance by vendor' })
  @ApiResponse({ status: 200, description: 'Outstanding balances retrieved successfully', type: [VendorOutstandingDto] })
  async getVendorOutstanding(): Promise<VendorOutstandingDto[]> {
    return this.analyticsService.getVendorOutstanding();
  }

  @Get('payment-aging')
  @ApiOperation({ summary: 'Get payment aging report' })
  @ApiResponse({ status: 200, description: 'Payment aging report retrieved successfully', type: PaymentAgingDto })
  async getPaymentAging(): Promise<PaymentAgingDto> {
    return this.analyticsService.getPaymentAging();
  }
}
