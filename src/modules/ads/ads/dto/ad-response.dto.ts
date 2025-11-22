import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdImageDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'https://example.com/images/ad/image1.jpg' })
  url: string;

  @ApiPropertyOptional({ example: 'https://example.com/images/ad/thumb_image1.jpg' })
  thumbnailUrl?: string | null;

  @ApiProperty({ example: 1 })
  sortOrder: number;

  @ApiProperty({ example: true })
  isPrimary: boolean;

  @ApiProperty({ example: 'Front view of iPhone' })
  caption?: string;

  @ApiProperty({ example: 'image/jpeg' })
  fileType?: string;

  @ApiProperty({ example: 2048576 })
  fileSize?: number;
}

export class AdCategoryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Electronics' })
  name: string;

  @ApiProperty({ example: 'electronics' })
  slug: string;
}

export class AdOwnerDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '+1-555-123-4567' })
  phoneNumber: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email?: string;
}

export class AdResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'iPhone 14 Pro Max - Excellent Condition' })
  title: string;

  @ApiProperty({ example: 'Brand new iPhone 14 Pro Max in excellent condition. 256GB storage, Deep Purple color.' })
  description: string;

  // Category
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  category_id: string;

  @ApiPropertyOptional({ type: AdCategoryDto })
  category?: AdCategoryDto;

  // Pricing
  @ApiProperty({ example: 999.99 })
  price: number;

  @ApiPropertyOptional({ example: 'USD' })
  price_unit?: string;

  @ApiProperty({ example: true })
  is_negotiable: boolean;

  // Status
  @ApiProperty({ example: 'AVAILABLE', enum: ['AVAILABLE', 'SOLD', 'RESERVED', 'WITHDRAWN'] })
  status: string;

  // Location
  @ApiProperty({ description: 'Door number', example: '12A' })
  door_number: string;

  @ApiProperty({ description: 'Street name', example: 'Main Street' })
  street_name: string;

  @ApiPropertyOptional({ example: '123 Main Street, Apt 4B' })
  address_line?: string;

  @ApiProperty({ example: 'New York' })
  city: string;

  @ApiProperty({ example: 'Manhattan' })
  district: string;

  @ApiProperty({ example: 'New York' })
  state: string;

  @ApiProperty({ example: '10001' })
  postal_code: string;

  @ApiProperty({ example: 'United States' })
  country: string;

  @ApiPropertyOptional({ example: 40.7128 })
  latitude?: number;

  @ApiPropertyOptional({ example: -74.0060 })
  longitude?: number;

  // Contact Information
  @ApiPropertyOptional({ example: 'John Doe' })
  contact_name?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567' })
  contact_phone?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  contact_email?: string;

  // Boost/Promotion Features
  @ApiProperty({ example: false })
  is_boosted: boolean;

  @ApiPropertyOptional({ example: 'PREMIUM', enum: ['PREMIUM', 'FEATURED', 'URGENT'] })
  active_boost_type?: string;

  @ApiPropertyOptional({ example: '2024-12-07T10:30:00.000Z' })
  boost_expires_at?: Date;

  @ApiProperty({ example: 0 })
  boost_priority: number;

  @ApiProperty({ example: false })
  is_top_listing: boolean;

  @ApiPropertyOptional({ example: '2024-11-14T10:30:00.000Z' })
  top_listing_expires_at?: Date;

  // Owner
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  owner_id: string;

  @ApiPropertyOptional({ type: AdOwnerDto })
  owner?: AdOwnerDto;

  // Approval Status
  @ApiProperty({ example: 'APPROVED', enum: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'] })
  approval_status: string;

  // Publication Status
  @ApiProperty({ example: true })
  is_published: boolean;

  @ApiProperty({ example: false })
  is_verified: boolean;

  @ApiProperty({ example: false })
  is_premium: boolean;

  @ApiProperty({ example: false })
  is_featured: boolean;

  @ApiProperty({ example: true })
  is_active: boolean;

  // SEO
  @ApiPropertyOptional({ example: 'iphone-14-pro-max-excellent-condition-nyc' })
  slug?: string;

  @ApiPropertyOptional({ example: 'Buy iPhone 14 Pro Max in excellent condition. Located in New York City.' })
  meta_description?: string;

  @ApiPropertyOptional({ example: 'iPhone 14 Pro Max, smartphone, Apple, 256GB, Deep Purple, NYC, electronics' })
  meta_keywords?: string;

  // Analytics
  @ApiProperty({ example: 45 })
  view_count: number;

  @ApiProperty({ example: 12 })
  favorite_count: number;

  @ApiProperty({ example: 8 })
  contact_count: number;

  @ApiProperty({ example: 23 })
  click_count: number;

  // Expiry
  @ApiPropertyOptional({ example: '2024-12-07T10:30:00.000Z' })
  expires_at?: Date;

  // Timestamps
  @ApiProperty({ example: '2024-11-07T10:30:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2024-11-07T11:15:00.000Z' })
  updated_at: Date;

  @ApiPropertyOptional({ example: '2024-11-07T10:35:00.000Z' })
  published_at?: Date;

  @ApiPropertyOptional({ example: '2024-11-07T12:00:00.000Z' })
  approved_at?: Date;

  // Relationships
  @ApiProperty({ type: [AdImageDto] })
  images: AdImageDto[];
}
