import { ApiProperty } from '@nestjs/swagger';

export class AgingBucketDto {
  @ApiProperty()
  bucket: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  amount: number;
}

export class PaymentAgingDto {
  @ApiProperty({ type: [AgingBucketDto] })
  aging: AgingBucketDto[];

  @ApiProperty()
  totalOverdue: number;

  @ApiProperty()
  totalOverdueCount: number;
}
