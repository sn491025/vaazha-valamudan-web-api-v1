import { ApiProperty } from '@nestjs/swagger';

export class PropertyStatsResponseDto {
  @ApiProperty({ description: 'Total property views' })
  views: number;

  @ApiProperty({ description: 'Total favorites count' })
  favorites: number;

  @ApiProperty({ description: 'Total enquiries count' })
  enquiries: number;

  @ApiProperty({ description: 'Days since property was listed' })
  daysListed: number;

  @ApiProperty({ description: 'Average views per day' })
  viewsPerDay: number;

  @ApiProperty({ description: 'Comparison with similar properties' })
  compareToSimilar: {
    views: number;
    favorites: number;
    enquiries: number;
  };
}

export class AgentStatsResponseDto {
  @ApiProperty({ description: 'Total listings count' })
  totalListings: number;

  @ApiProperty({ description: 'Active listings count' })
  activeListings: number;

  @ApiProperty({ description: 'Total enquiries received' })
  totalEnquiries: number;

  @ApiProperty({ description: 'New enquiries count' })
  newEnquiries: number;

  @ApiProperty({ description: 'Response rate percentage' })
  responseRate: number;

  @ApiProperty({ description: 'Average response time in hours' })
  avgResponseTime: number;

  @ApiProperty({ description: 'Conversion rate percentage' })
  conversionRate: number;
}
