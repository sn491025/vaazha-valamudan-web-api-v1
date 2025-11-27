import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PropertyFeatureValueDto } from './property-feature-value.dto';
import { UpdatePropertyMediaDto } from '../../property-media/dto/update-property-media.dto';
import { Column } from 'typeorm';


export class UpdatePropertyDto {
  @ApiPropertyOptional({ description: 'Property title', example: 'Updated title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Property description', example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Property category ID', example: '11111111-1111-1111-1111-111111111111' })
  @IsUUID()
  @IsOptional()
  property_category_id?: string;

  @ApiPropertyOptional({ description: 'Property price', example: 125000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Price unit (e.g. per month, total)', example: 'total' })
  @IsString()
  @IsOptional()
  price_unit?: string;

  @ApiProperty({ description: 'Property size', example: 120000 })
  @IsNumber()
  @Min(0)
  property_size: number; // Searchable/filterable in Elasticsearch

  @ApiPropertyOptional({ description: 'Size unit (e.g. sq.ft, sqm, acre)', example: 'total' })
  @IsString()
  @IsOptional()
  @Column({ type: 'varchar', length: 50, nullable: true })
  property_size_unit: string; // e.g., 'Sq', 'cm'


  @ApiPropertyOptional({ description: 'Listing type', enum: ['SALE', 'RENT', 'LEASE'], example: 'RENT' })
  @IsEnum(['SALE', 'RENT', 'LEASE'])
  @IsOptional()
  listing_type?: string;

  @ApiPropertyOptional({ description: 'Property status', enum: ['AVAILABLE', 'SOLD', 'RENTED', 'PENDING_SALE'], example: 'AVAILABLE' })
  @IsEnum(['AVAILABLE', 'SOLD', 'RENTED', 'PENDING_SALE'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Door number', example: '12A' })
  @IsString()
  @IsOptional()
  door_number?: string;

  @ApiPropertyOptional({ description: 'Street name', example: 'Main Street' })
  @IsString()
  @IsOptional()
  street_name?: string;

  @ApiPropertyOptional({ description: 'Address line', example: 'Near Central Park' })
  @IsString()
  @IsOptional()
  address_line?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Metropolis' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'District', example: 'Downtown' })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiPropertyOptional({ description: 'State/Province', example: 'New York' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal/Zip code', example: '10001' })
  @IsString()
  @IsOptional()
  postal_code?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'USA' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Latitude', example: 40.712776 })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude', example: -74.005974 })
  @IsLongitude()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Agent/broker ID if different from owner', example: '22222222-2222-2222-2222-222222222222', nullable: true })
  @Transform(({ value }) => {
    if (!value || value === '') {
      return null;
    }
    return value;
  }, { toClassOnly: true })
  @IsOptional()
  agent_id?: string;

  // Contact Information
  @ApiPropertyOptional({ description: 'Contact person name', example: 'John Smith' })
  @IsString()
  @IsOptional()
  contact_name?: string;

  @ApiPropertyOptional({ description: 'Contact phone number', example: '+1-555-0123' })
  @IsString()
  @IsOptional()
  contact_phone?: string;

  @ApiPropertyOptional({ description: 'Contact email address', example: 'contact@example.com' })
  @IsString()
  @IsOptional()
  contact_email?: string;

  @ApiPropertyOptional({ description: 'Whether property is published', example: true })
  @IsBoolean()
  @IsOptional()
  is_published?: boolean;

  // Property Boost/Promotion Fields (Subscription Features)
  @ApiPropertyOptional({ description: 'Whether to boost the property (subscription feature)', example: false })
  @IsBoolean()
  @IsOptional()
  is_boosted?: boolean;

  @ApiPropertyOptional({ description: 'Boost duration in days', example: 30 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  boost_duration_days?: number;

  @ApiPropertyOptional({ description: 'Boost priority (higher = more visibility)', example: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  boost_priority?: number;

  @ApiPropertyOptional({ description: 'Whether to make this a top listing (premium subscription feature)', example: false })
  @IsBoolean()
  @IsOptional()
  is_top_listing?: boolean;

  @ApiPropertyOptional({ description: 'Top listing duration in days', example: 7 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  top_listing_duration_days?: number;

  @ApiPropertyOptional({ description: 'Property features to replace (replaces existing)', type: [PropertyFeatureValueDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyFeatureValueDto)
  @IsOptional()
  features?: PropertyFeatureValueDto[];

  @ApiPropertyOptional({ description: 'Media updates', type: () => UpdatePropertyMediaDto })
  @ValidateNested()
  @Type(() => UpdatePropertyMediaDto)
  @IsOptional()
  media?: UpdatePropertyMediaDto;
}
