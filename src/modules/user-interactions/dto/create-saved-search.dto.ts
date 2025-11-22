import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';

export enum EntityType {
  PROPERTY = 'property',
  AD = 'ad',
}

export class CreateSavedSearchDto {
  @ApiProperty({ 
    description: 'Entity type to search for',
    enum: EntityType,
    example: EntityType.PROPERTY
  })
  @IsEnum(EntityType)
  entity_type: EntityType;

  @ApiProperty({ 
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
  search_criteria: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'Name for the saved search',
    example: 'Downtown Apartments Under 500K'
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ 
    description: 'Whether to receive notifications for new matches',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  notify_on_new?: boolean = true;
}
