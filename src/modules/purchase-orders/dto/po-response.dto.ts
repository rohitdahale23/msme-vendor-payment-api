import { ApiProperty } from '@nestjs/swagger';

export class POItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  lineTotal: number;
}

export class PaymentHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paymentReference: string;

  @ApiProperty()
  paymentDate: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  paymentMethod: string;
}

export class POResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  poNumber: string;

  @ApiProperty()
  vendorId: string;

  @ApiProperty()
  vendorName: string;

  @ApiProperty()
  poDate: Date;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: [POItemResponseDto] })
  items: POItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: [PaymentHistoryDto], required: false })
  payments?: PaymentHistoryDto[];

  @ApiProperty({ required: false })
  totalPaid?: number;

  @ApiProperty({ required: false })
  outstanding?: number;
}
