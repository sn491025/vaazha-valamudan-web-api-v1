import { ApiProperty } from '@nestjs/swagger';

export class PropertySummaryByDistrictDto {
  @ApiProperty({
    example: 'Chennai',
    description: 'Name of the district'
  })
  district: string;

  @ApiProperty({
    example: 12,
    description: 'Total number of properties in this district'
  })
  count: number;

  @ApiProperty({
    example: 15000,
    description: 'Minimum property amount in this district'
  })
  minAmount: number;

  @ApiProperty({
    example: 95000,
    description: 'Maximum property amount in this district'
  })
  maxAmount: number;

  @ApiProperty({
    example: 4,
    description:
      'Number of distinct users who created properties in this district'
  })
  createdByCount: number;
}
