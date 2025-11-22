import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min
} from 'class-validator';

export class PropertyFilterDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Results per page', default: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['price_asc', 'price_desc', 'date_newest', 'date_oldest', 'most_viewed', 'most_popular'] })
  @IsEnum(['price_asc', 'price_desc', 'date_newest', 'date_oldest', 'most_viewed', 'most_popular'])
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({ description: 'Property category ID' })
  @IsUUID()
  @IsOptional()
  property_category_id?: string;

  @ApiPropertyOptional({ description: 'Listing type', enum: ['SALE', 'RENT', 'LEASE'] })
  @IsEnum(['SALE', 'RENT', 'LEASE'])
  @IsOptional()
  listing_type?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  min_price?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  max_price?: number;

  @ApiPropertyOptional({ description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Only featured properties' })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Only published properties' })
  @IsBoolean()
  @IsOptional()
  published?: boolean = true;

  @ApiPropertyOptional({ description: 'Property status' })
  @IsEnum(['AVAILABLE', 'SOLD', 'RENTED', 'PENDING_SALE'])
  @IsOptional()
  status?: string;
}