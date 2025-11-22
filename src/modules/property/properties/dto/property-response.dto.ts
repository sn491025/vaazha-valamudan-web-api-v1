// dtos/property-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { PropertyFeatureValueResponseDto } from './property-feature-value-response.dto';


export class PropertyResponseDto {
  @ApiProperty({
    example: 'ece03889-0db5-48eb-99fa-e3f9164d656a',
    description: 'Unique identifier for the property'
  })
  id: string;

  @ApiProperty({
    example: 'test 005',
    description: 'Title of the property listing'
  })
  title: string;

  @ApiProperty({
    example: 'a das dasd asdasd as',
    description: 'Detailed description of the property'
  })
  description: string;

  @ApiProperty({
    example: '68b2ad14-c237-4569-8365-3ba18e67b790',
    description: 'ID of the property category'
  })
  property_category_id: string;

  @ApiProperty({
    example: '323232323.00',
    description: 'Price of the property'
  })
  price: string;

  @ApiProperty({
    example: '',
    description: 'Unit for the price (e.g., per month, total)'
  })
  price_unit: string;

  @ApiProperty({
    example: null,
    description: 'Size of the property',
    nullable: true
  })
  property_size: number | null;

  @ApiProperty({
    example: null,
    description: 'Unit for the property size (e.g., sq.ft)',
    nullable: true
  })
  property_size_unit: string | null;

  @ApiProperty({
    example: 'SALE',
    description: 'Type of listing (SALE, RENT, LEASE)'
  })
  listing_type: string;

  @ApiProperty({
    example: 'AVAILABLE',
    description: 'Status of the property (AVAILABLE, SOLD, RENTED)'
  })
  status: string;

  @ApiProperty({ example: '' })
  door_number: string;

  @ApiProperty({ example: '' })
  street_name: string;

  @ApiProperty({
    example: '8P6F+46 Nalirukkai, Tamil Nadu, India',
    description: 'Full address line of the property'
  })
  address_line: string;

  @ApiProperty({ example: 'Nalirukkai' })
  city: string;

  @ApiProperty({ example: '' })
  district: string;

  @ApiProperty({ example: 'Tamil Nadu' })
  state: string;

  @ApiProperty({ example: '' })
  postal_code: string;

  @ApiProperty({ example: 'India' })
  country: string;

  @ApiProperty({
    example: null,
    description: 'Name of the contact person',
    nullable: true
  })
  contact_name: string | null;

  @ApiProperty({
    example: null,
    description: 'Contact phone number',
    nullable: true
  })
  contact_phone: string | null;

  @ApiProperty({
    example: null,
    description: 'Contact email address',
    nullable: true
  })
  contact_email: string | null;

  @ApiProperty({
    example: false,
    description: 'Whether this property listing is boosted'
  })
  is_boosted: boolean;

  @ApiProperty({
    example: null,
    description: 'When the boost expires',
    nullable: true
  })
  boost_expires_at: Date | null;

  @ApiProperty({
    example: 0,
    description: 'Priority of the boost'
  })
  boost_priority: number;

  @ApiProperty({
    example: false,
    description: 'Whether this is a top listing'
  })
  is_top_listing: boolean;

  @ApiProperty({
    example: null,
    description: 'When the top listing status expires',
    nullable: true
  })
  top_listing_expires_at: Date | null;

  @ApiProperty({
    example: '9.3102777',
    description: 'Latitude coordinates'
  })
  latitude: string;

  @ApiProperty({
    example: '78.7230443',
    description: 'Longitude coordinates'
  })
  longitude: string;

  @ApiProperty({
    example: 'cc98934f-d1f7-4e8d-8484-72d24f94b508',
    description: 'ID of the property owner'
  })
  owner_id: string;

  @ApiProperty({
    example: 'cc98934f-d1f7-4e8d-8484-72d24f94b508',
    description: 'ID of the agent handling this property'
  })
  agent_id: string;

  @ApiProperty({
    example: 'UNDER_REVIEW',
    description: 'Status of the approval process'
  })
  approval_status: string;

  @ApiProperty({
    example: false,
    description: 'Whether this property is published'
  })
  is_published: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this property has been verified'
  })
  is_verified: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this is a premium listing'
  })
  is_premium: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this is a featured listing'
  })
  is_featured: boolean;

  @ApiProperty({
    example: true,
    description: 'Whether this property is active'
  })
  is_active: boolean;

  @ApiProperty({
    example: null,
    description: 'SEO-friendly URL slug',
    nullable: true
  })
  slug: string | null;

  @ApiProperty({
    example: null,
    description: 'Meta description for SEO',
    nullable: true
  })
  meta_description: string | null;

  @ApiProperty({
    example: null,
    description: 'Meta keywords for SEO',
    nullable: true
  })
  meta_keywords: string | null;

  @ApiProperty({
    example: 0,
    description: 'Number of views this property has received'
  })
  view_count: number;

  @ApiProperty({
    example: 0,
    description: 'Number of times this property has been favorited'
  })
  favorite_count: number;

  @ApiProperty({
    example: 0,
    description: 'Number of contact inquiries for this property'
  })
  contact_count: number;

  @ApiProperty({
    example: true,
    description: 'User has favorited this property'
  })
  is_user_favorite: boolean = false;

  @ApiProperty({
    example: '2025-10-28T13:51:12.216Z',
    description: 'When this property was created'
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-10-28T13:51:12.216Z',
    description: 'When this property was last updated'
  })
  updated_at: Date;

  @ApiProperty({
    example: null,
    description: 'When this property was published',
    nullable: true
  })
  published_at: Date | null;

  @ApiProperty({
    example: null,
    description: 'When this property was approved',
    nullable: true
  })
  approved_at: Date | null;

  @ApiProperty({
    type: [PropertyFeatureValueResponseDto],
    description: 'Feature values for this property'
  })
  feature_values: PropertyFeatureValueResponseDto[];

  @ApiProperty({
    type: [Object],
    description: 'Media files for this property'
  })
  media: any[];

  @ApiProperty({
    type: [Object],
    description: 'Approval history for this property'
  })
  approvals: any[];

  @ApiProperty({
    type: [Object],
    description: 'Reports for this property'
  })
  reports: any[];
}