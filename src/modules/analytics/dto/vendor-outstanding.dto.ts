import { ApiProperty } from '@nestjs/swagger';

export class VendorOutstandingDto {
  @ApiProperty()
  vendorId: string;

  @ApiProperty()
  vendorName: string;

  @ApiProperty()
  totalPurchaseOrders: number;

  @ApiProperty()
  totalPOAmount: number;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  outstanding: number;
}
