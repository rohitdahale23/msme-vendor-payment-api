import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { POStatus } from '../../../database/entities/purchase-order.entity';

export class PurchaseOrderItemDto {
  @ApiProperty({ example: 'Steel Rods - Grade A' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 250.50 })
  @IsNumber()
  @IsPositive()
  unitPrice: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  vendorId: string;

  @ApiProperty({ example: '2026-01-15' })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  poDate: Date;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @ApiProperty({ enum: POStatus, example: 'DRAFT', required: false })
  @IsEnum(POStatus)
  @IsOptional()
  status?: POStatus;
}
