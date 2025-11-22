import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, MaxLength, Min, Max, IsEmail } from 'class-validator';

export class CreateAdDto {
  @ApiProperty({ 
    example: 'iPhone 14 Pro Max - Excellent Condition', 
    description: 'Ad title (max 200 characters)',
    maxLength: 200
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ 
    example: 'Brand new iPhone 14 Pro Max in excellent condition. 256GB storage, Deep Purple color. Includes original box, charger, and unused earphones. Never dropped, screen protector applied since day one.', 
    description: 'Detailed ad description'
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000', 
    description: 'Category UUID'
  })
  @IsUUID()
  category_id: string;

  @ApiProperty({ 
    example: 999.99, 
    description: 'Item price (up to 12 digits with 2 decimal places)'
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiProperty({ 
    example: 'USD', 
    required: false, 
    description: 'Price currency or unit',
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  price_unit?: string;

  @ApiProperty({ 
    example: true, 
    required: false, 
    description: 'Whether the price is negotiable',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_negotiable?: boolean;

  @ApiProperty({ 
    example: 'AVAILABLE', 
    required: false, 
    description: 'Ad status (AVAILABLE, SOLD, RESERVED, WITHDRAWN)',
    enum: ['AVAILABLE', 'SOLD', 'RESERVED', 'WITHDRAWN'],
    default: 'AVAILABLE'
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiProperty({ description: 'Door number', example: '12A' })
  @IsString()
  door_number: string;

  @ApiProperty({ description: 'Street name', example: 'Main Street' })
  @IsString()
  street_name: string;

  @ApiProperty({ 
    example: '123 Main Street, Apt 4B', 
    required: false, 
    description: 'Full address line',
    maxLength: 200
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address_line?: string;

  @ApiProperty({ 
    example: 'New York', 
    description: 'City name',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({ 
    example: 'Manhattan', 
    description: 'District or borough',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  district: string;

  @ApiProperty({ 
    example: 'New York', 
    description: 'State or province',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  state: string;

  @ApiProperty({ 
    example: '10001', 
    description: 'Postal/ZIP code',
    maxLength: 10
  })
  @IsString()
  @MaxLength(10)
  postal_code: string;

  @ApiProperty({ 
    example: 'United States', 
    description: 'Country name',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiProperty({ 
    example: 40.7128, 
    required: false, 
    description: 'GPS latitude coordinate'
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiProperty({ 
    example: -74.0060, 
    required: false, 
    description: 'GPS longitude coordinate'
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiProperty({ 
    example: 'John Doe', 
    required: false, 
    description: 'Contact person name',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contact_name?: string;

  @ApiProperty({ 
    example: '+1-555-123-4567', 
    required: false, 
    description: 'Contact phone number',
    maxLength: 20
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contact_phone?: string;

  @ApiProperty({ 
    example: 'john.doe@example.com', 
    required: false, 
    description: 'Contact email address',
    maxLength: 100
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  contact_email?: string;

  // Boost/Promotion fields
  @ApiProperty({ 
    example: false, 
    required: false, 
    description: 'Enable ad boost promotion',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_boosted?: boolean;

  @ApiProperty({ 
    example: 30, 
    required: false, 
    description: 'Boost duration in days (1-365)',
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  boost_duration_days?: number;

  @ApiProperty({ 
    example: 'PREMIUM', 
    required: false, 
    description: 'Boost type (PREMIUM, FEATURED, URGENT)',
    enum: ['PREMIUM', 'FEATURED', 'URGENT']
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  boost_type?: string;

  @ApiProperty({ 
    example: 1, 
    required: false, 
    description: 'Boost priority level (0-10)',
    minimum: 0,
    maximum: 10,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  boost_priority?: number;

  @ApiProperty({ 
    example: false, 
    required: false, 
    description: 'Make ad a top listing',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_top_listing?: boolean;

  @ApiProperty({ 
    example: 7, 
    required: false, 
    description: 'Top listing duration in days (1-30)',
    minimum: 1,
    maximum: 30
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  top_listing_duration_days?: number;

  // Publication settings
  @ApiProperty({ 
    example: false, 
    required: false, 
    description: 'Publish ad immediately',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @ApiProperty({ 
    example: false, 
    required: false, 
    description: 'Mark as premium ad',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_premium?: boolean;

  @ApiProperty({ 
    example: false, 
    required: false, 
    description: 'Mark as featured ad',
    default: false
  })
  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;

  // SEO fields
  @ApiProperty({ 
    example: 'iphone-14-pro-max-excellent-condition-nyc', 
    required: false, 
    description: 'SEO-friendly URL slug',
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiProperty({ 
    example: 'Buy iPhone 14 Pro Max in excellent condition. 256GB, Deep Purple, includes accessories. Located in New York City.', 
    required: false, 
    description: 'SEO meta description'
  })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiProperty({ 
    example: 'iPhone 14 Pro Max, smartphone, Apple, 256GB, Deep Purple, NYC, electronics', 
    required: false, 
    description: 'SEO keywords (comma-separated)'
  })
  @IsOptional()
  @IsString()
  meta_keywords?: string;

  // Expiry
  @ApiProperty({ 
    example: 30, 
    required: false, 
    description: 'Ad expiry in days from creation (1-365)',
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  expires_in_days?: number;
}