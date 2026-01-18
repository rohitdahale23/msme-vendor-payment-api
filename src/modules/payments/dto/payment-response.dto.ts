import { ApiProperty } from '@nestjs/swagger';

export class PaymentPODetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  poNumber: string;

  @ApiProperty()
  vendorName: string;

  @ApiProperty()
  totalAmount: number;
}

export class PaymentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paymentReference: string;

  @ApiProperty()
  purchaseOrderId: string;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  purchaseOrder?: PaymentPODetailsDto;
}