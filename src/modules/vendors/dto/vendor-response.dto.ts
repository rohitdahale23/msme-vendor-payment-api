import { ApiProperty } from '@nestjs/swagger';

export class VendorPaymentSummary {
  @ApiProperty()
  totalPurchaseOrders: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  outstanding: number;
}

export class VendorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  contactPerson: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  paymentTerms: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  paymentSummary?: VendorPaymentSummary;
}