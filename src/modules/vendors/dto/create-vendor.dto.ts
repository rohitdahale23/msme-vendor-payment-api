import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VendorStatus, PaymentTerms } from '../../../database/entities/vendor.entity';

export class CreateVendorDto {
  @ApiProperty({ example: 'ABC Manufacturing Ltd' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  contactPerson?: string;

  @ApiProperty({ example: 'contact@abcmfg.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91-9876543210', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: PaymentTerms, example: 30 })
  @IsInt()
  @IsEnum(PaymentTerms)
  @IsOptional()
  paymentTerms?: PaymentTerms;

  @ApiProperty({ enum: VendorStatus, example: 'ACTIVE' })
  @IsEnum(VendorStatus)
  @IsOptional()
  status?: VendorStatus;
}
