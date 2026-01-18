import { IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { POStatus } from '../../../database/entities/purchase-order.entity';

export class POFilterDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  vendorId?: string;

  @ApiProperty({ enum: POStatus, required: false })
  @IsEnum(POStatus)
  @IsOptional()
  status?: POStatus;

  @ApiProperty({ required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 20, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
