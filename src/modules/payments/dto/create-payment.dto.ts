import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../database/entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  purchaseOrderId: string;

  @ApiProperty({ example: '2026-01-18' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  paymentDate: Date;

  @ApiProperty({ example: 5000.00 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: 'NEFT' })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'Partial payment for Q1 delivery', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
