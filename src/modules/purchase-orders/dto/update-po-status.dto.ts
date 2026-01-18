import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { POStatus } from '../../../database/entities/purchase-order.entity';

export class UpdatePOStatusDto {
  @ApiProperty({ enum: POStatus, example: 'APPROVED' })
  @IsEnum(POStatus)
  @IsNotEmpty()
  status: POStatus;
}