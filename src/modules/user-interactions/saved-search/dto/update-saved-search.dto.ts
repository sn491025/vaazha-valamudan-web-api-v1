import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSavedSearchDto {
  @ApiPropertyOptional({ 
    description: 'Search criteria object',
    example: {
      location: 'New York',
      minPrice: 100000,
      maxPrice: 500000,
      propertyType: 'apartment',
      bedrooms: 2
    }
  })
  @IsObject()
  @IsOptional()
  search_criteria?: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Name for the saved search',
    example: 'Downtown Apartments Under 500K'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Whether the search is active',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ 
    description: 'Whether to receive notifications for new matches',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  notify_on_new?: boolean;
}
