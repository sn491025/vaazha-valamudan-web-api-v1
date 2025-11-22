import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
  ApiResponse
} from '@nestjs/swagger';
import { PropertyService } from './services/property.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { PropertyFeatureValueDto } from './dto/property-feature-value.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Properties')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('properties')
export class PropertyController {
  constructor(private readonly service: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a property' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    description: 'New property payload',
    type: CreatePropertyDto,
    examples: {
      sample: {
        summary: 'Apartment for sale with complete details',
        value: {
          title: 'Spacious 3BHK Apartment in Downtown',
          description: 'A beautiful 3-bedroom apartment with modern amenities.',
          property_category_id: '11111111-1111-1111-1111-111111111111',
          price: 120000,
          price_unit: 'total',
          listing_type: 'SALE',
          status: 'AVAILABLE',
          door_number: '12A',
          street_name: 'Main Street',
          address_line: 'Near Central Park',
          city: 'Metropolis',
          district: 'Downtown',
          state: 'New York',
          postal_code: '10001',
          country: 'USA',
          latitude: 40.712776,
          longitude: -74.005974,
          agent_id: '22222222-2222-2222-2222-222222222222',
          // Contact Information
          contact_name: 'John Smith',
          contact_phone: '+1-555-0123',
          contact_email: 'john.smith@example.com',
          is_published: false,
          features: [
            // Multi-select example
            {
              feature_category_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
              feature_group_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
              option_ids: [
                'cccccccc-cccc-cccc-cccc-cccccccccccc',
                'dddddddd-dddd-dddd-dddd-dddddddddddd'
              ]
            }
          ]
        }
      },
      'property-with-all-feature-types': {
        summary:
          'Property with all feature types (single_select, multi_select, numeric, text, boolean)',
        value: {
          title: 'Luxury 4BHK Villa with Premium Amenities',
          description: 'Fully furnished villa in a gated community',
          property_category_id: '11111111-1111-1111-1111-111111111111',
          price: 250000,
          price_unit: 'total',
          listing_type: 'SALE',
          status: 'AVAILABLE',
          door_number: '456',
          street_name: 'Palm Avenue',
          address_line: 'Near Lakeside',
          city: 'Metropolis',
          state: 'California',
          postal_code: '90210',
          country: 'USA',
          latitude: 34.0522,
          longitude: -118.2437,
          is_published: false,
          features: [
            // SINGLE_SELECT
            {
              feature_category_id: 'cat-bhk-0000-0000-0000-000000000001',
              feature_group_id: 'grp-basic-0000-0000-000000000001',
              option_id: 'opt-4bhk-0000-0000-0000-000000000001'
            },
            // MULTI_SELECT
            {
              feature_category_id: 'cat-amenities-0000-000000000004',
              feature_group_id: 'grp-facilities-0000-000000000002',
              option_ids: [
                'opt-swimming-pool-0000-000000000004',
                'opt-gym-00000-0000-0000-000000000004',
                'opt-parking-0000-0000-0000-000000000004'
              ]
            },
            // NUMERIC
            {
              feature_category_id: 'cat-builtup-area-0000-000000000006',
              feature_group_id: 'grp-dimensions-0000-000000000004',
              value_number: 2500
            },
            // TEXT
            {
              feature_category_id: 'cat-special-features-000000000013',
              feature_group_id: 'grp-additional-0000-000000000006',
              value_text: 'Corner unit with panoramic views'
            },
            // BOOLEAN
            {
              feature_category_id: 'cat-gated-community-000000000015',
              feature_group_id: 'grp-facilities-0000-000000000002',
              value_boolean: true
            }
          ]
        }
      },
      'minimal-features': {
        summary: 'Property with only mandatory features',
        value: {
          title: '2BHK Apartment for Rent',
          description: 'Affordable apartment in central location',
          property_category_id: '11111111-1111-1111-1111-111111111111',
          price: 1500,
          price_unit: 'monthly',
          listing_type: 'RENT',
          status: 'AVAILABLE',
          city: 'Metropolis',
          state: 'New York',
          country: 'USA',
          is_published: false,
          features: [
            {
              feature_category_id: 'cat-bhk-0000-0000-0000-000000000001',
              option_id: 'opt-2bhk-0000-0000-0000-000000000001'
            },
            {
              feature_category_id: 'cat-builtup-area-0000-000000000006',
              value_number: 950
            }
          ]
        }
      },
      'boosted-property': {
        summary: 'Property with boost features (subscription)',
        description:
          'Example of creating a property with boost and top listing features for premium subscribers',
        value: {
          title: 'Premium 3BHK Villa with Boost',
          description:
            'Luxury villa with premium boost features for maximum visibility. Modern amenities, prime location, and stunning city views.',
          property_category_id: '11111111-1111-1111-1111-111111111111',
          price: 750000,
          price_unit: 'total',
          listing_type: 'SALE',
          status: 'AVAILABLE',
          door_number: '123',
          street_name: 'Premium Boulevard',
          address_line: 'Gated Community, Tower A',
          city: 'Manhattan',
          district: 'Upper East Side',
          state: 'New York',
          postal_code: '10075',
          country: 'USA',
          latitude: 40.7719,
          longitude: -73.9593,
          // Contact Information
          contact_name: 'Premium Real Estate Agent',
          contact_phone: '+1-555-PREMIUM',
          contact_email: 'premium.agent@luxuryrealty.com',
          // Boost Features (Subscription) - Applied during creation
          is_boosted: true,
          boost_duration_days: 60,
          boost_priority: 5,
          is_top_listing: true,
          top_listing_duration_days: 14,
          is_published: true,
          features: [
            {
              feature_category_id: 'cat-bhk-0000-0000-0000-000000000001',
              feature_group_id: 'grp-basic-0000-0000-000000000001',
              option_id: 'opt-3bhk-0000-0000-0000-000000000001'
            },
            {
              feature_category_id: 'cat-amenities-0000-000000000004',
              feature_group_id: 'grp-facilities-0000-000000000002',
              option_ids: [
                'opt-swimming-pool-0000-000000000004',
                'opt-gym-00000-0000-0000-000000000004',
                'opt-parking-0000-0000-0000-000000000004',
                'opt-concierge-0000-0000-000000000004'
              ]
            }
          ]
        }
      },
      'standard-property': {
        summary: 'Standard property without boost',
        description: 'Regular property listing without any boost features',
        value: {
          title: 'Cozy 2BHK Apartment',
          description:
            'Well-maintained 2-bedroom apartment in a quiet neighborhood',
          property_category_id: '11111111-1111-1111-1111-111111111111',
          price: 250000,
          price_unit: 'total',
          listing_type: 'SALE',
          status: 'AVAILABLE',
          door_number: '45',
          street_name: 'Oak Street',
          city: 'Brooklyn',
          district: 'Park Slope',
          state: 'New York',
          postal_code: '11215',
          country: 'USA',
          contact_name: 'Local Agent',
          contact_phone: '+1-555-0123',
          contact_email: 'agent@localrealty.com',
          is_published: false,
          features: [
            {
              feature_category_id: 'cat-bhk-0000-0000-0000-000000000001',
              option_id: 'opt-2bhk-0000-0000-0000-000000000001'
            }
          ]
        }
      }
    }
  })
  async create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser() user: any,
    @Query('ownerId') ownerId?: string
  ) {
    const resolvedOwnerId = this.resolveOwnerId({ user }, ownerId);
    return this.service.create(dto, resolvedOwnerId);
  }

  @Get()
  @ApiOperation({ summary: 'List properties (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number (starting from 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Number of properties per page (1-50)'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'AVAILABLE',
    description: 'Filter by property status',
    enum: ['AVAILABLE', 'SOLD', 'RENTED', 'UNDER_OFFER', 'WITHDRAWN']
  })
  @ApiQuery({
    name: 'listing_type',
    required: false,
    example: 'SALE',
    description: 'Filter by listing type',
    enum: ['SALE', 'RENT']
  })
  @ApiQuery({
    name: 'approval_status',
    required: false,
    example: 'UNDER RIVEW',
    description: 'Filter by approval status',
    enum: ['UNDER RIVEW', 'APPROVAL', 'REJECTED']
  })
  async list(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('listing_type') listing_type?: string,
    @Query('approval_status') approval_status?: string
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.service.findAll(
      p,
      l,
      { status, listing_type, approval_status: approval_status },
      user.id
    );
  }

  @Get('favorites')
  @ApiOperation({ summary: 'List properties (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number (starting from 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Number of properties per page (1-50)'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'AVAILABLE',
    description: 'Filter by property status',
    enum: ['AVAILABLE', 'SOLD', 'RENTED', 'UNDER_OFFER', 'WITHDRAWN']
  })
  @ApiQuery({
    name: 'listing_type',
    required: false,
    example: 'SALE',
    description: 'Filter by listing type',
    enum: ['SALE', 'RENT']
  })
  @ApiQuery({
    name: 'approval_status',
    required: false,
    example: 'UNDER RIVEW',
    description: 'Filter by approval status',
    enum: ['UNDER RIVEW', 'APPROVAL', 'REJECTED']
  })
  async myFavoritesList(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('listing_type') listing_type?: string,
    @Query('approval_status') approval_status?: string
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.service.findMyFavorites(
      p,
      l,
      { status, listing_type, approval_status: approval_status },
      user.id
    );
  }

  @Get(['me', 'my-properties'])
  @ApiOperation({ summary: 'List my properties (paginated)' })
  @ApiResponse({
    status: 200,
    description: 'My properties retrieved successfully'
  })
  @ApiQuery({
    name: 'ownerId',
    required: false,
    example: '00000000-0000-0000-0000-000000000000',
    description: 'Owner ID (optional if authenticated)'
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async myList(
    @CurrentUser() user: any,
    @Query('ownerId') ownerId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const resolvedOwnerId = this.resolveOwnerId({ user }, ownerId);
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);
    return this.service.myProperties(resolvedOwnerId, p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a property by id' })
  @ApiResponse({
    status: 200,
    description: 'Property details retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Property UUID'
  })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a property' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not property owner' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({
    description: 'Property fields to update',
    type: UpdatePropertyDto,
    examples: {
      'basic-update': {
        summary: 'Update basic property information',
        value: {
          title: 'Updated Property Title',
          description: 'Updated property description with new details',
          price: 135000,
          status: 'AVAILABLE',
          is_published: true
        }
      },
      'price-update': {
        summary: 'Update only price',
        value: {
          price: 125000,
          price_unit: 'total'
        }
      },
      'status-update': {
        summary: 'Update property status',
        value: {
          status: 'UNDER_OFFER'
        }
      },
      'contact-update': {
        summary: 'Update contact information',
        value: {
          contact_name: 'New Agent Name',
          contact_phone: '+1-555-9999',
          contact_email: 'newagent@realty.com'
        }
      }
    }
  })
  async update(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a property' })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not property owner' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  async remove(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a property' })
  @ApiResponse({ status: 200, description: 'Property published successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  async publish(@Param('id') id: string) {
    return this.service.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish a property' })
  @ApiResponse({
    status: 200,
    description: 'Property unpublished successfully'
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  async unpublish(@Param('id') id: string) {
    return this.service.unpublish(id);
  }

  @Put(':id/features')
  @ApiOperation({ summary: 'Replace property features' })
  @ApiResponse({
    status: 200,
    description: 'Property features updated successfully'
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiBody({
    description: 'Array of feature values to replace',
    isArray: true,
    type: PropertyFeatureValueDto,
    examples: {
      sample: {
        summary: 'Replace features with mixed types',
        value: [
          // MULTI_SELECT
          {
            feature_category_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            feature_group_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            option_ids: ['cccccccc-cccc-cccc-cccc-cccccccccccc']
          },
          // SINGLE_SELECT
          {
            feature_category_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
            option_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff'
          },
          // NUMERIC
          {
            feature_category_id: '11111111-2222-3333-4444-555555555555',
            value_number: 1200
          },
          // TEXT
          {
            feature_category_id: '66666666-7777-8888-9999-000000000000',
            value_text: 'Recently renovated kitchen and bathrooms'
          },
          // BOOLEAN
          {
            feature_category_id: '12121212-3434-5656-7878-909090909090',
            value_boolean: true
          }
        ]
      }
    }
  })
  async replaceFeatures(
    @Param('id') id: string,
    @Body() features: PropertyFeatureValueDto[]
  ) {
    await this.service.replaceFeatures(id, features || []);
    return this.service.findOne(id);
  }

  // Property Boost/Promotion Endpoints (Subscription Features)
  @Post(':id/boost')
  @ApiOperation({
    summary: 'Boost property (subscription feature)',
    description:
      'Boost a property to increase its visibility in search results. Requires active subscription plan.'
  })
  @ApiResponse({ status: 200, description: 'Property boosted successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({
    status: 402,
    description: 'Payment required - insufficient subscription credits'
  })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Property ID to boost'
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    example: 30,
    description: 'Boost duration in days (7, 15, 30, or 60). Default: 30',
    enum: [7, 15, 30, 60]
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    example: 3,
    description:
      'Boost priority level (1-5). Higher number = more visibility. Default: 1',
    enum: [1, 2, 3, 4, 5]
  })
  async boostProperty(
    @Param('id') id: string,
    @Query('duration') duration?: string,
    @Query('priority') priority?: string
  ) {
    const boostDuration = duration ? parseInt(duration, 10) : 30;
    const boostPriority = priority ? parseInt(priority, 10) : 1;
    return this.service.boostProperty(id, boostDuration, boostPriority);
  }

  @Post(':id/top-listing')
  @ApiOperation({
    summary: 'Make property a top listing (premium subscription feature)',
    description:
      'Promote property to top listing section for maximum visibility. Requires premium subscription.'
  })
  @ApiResponse({
    status: 200,
    description: 'Property promoted to top listing successfully'
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({
    status: 402,
    description: 'Payment required - premium subscription required'
  })
  @ApiParam({
    name: 'id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Property ID to promote to top listing'
  })
  @ApiQuery({
    name: 'duration',
    required: false,
    example: 7,
    description: 'Top listing duration in days (3, 7, 14, or 30). Default: 7',
    enum: [3, 7, 14, 30]
  })
  async makeTopListing(
    @Param('id') id: string,
    @Query('duration') duration?: string
  ) {
    const topListingDuration = duration ? parseInt(duration, 10) : 7;
    return this.service.makeTopListing(id, topListingDuration);
  }

  @Delete(':id/boost')
  @ApiOperation({ summary: 'Remove property boost' })
  @ApiResponse({
    status: 200,
    description: 'Property boost removed successfully'
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  async removeBoost(@Param('id') id: string) {
    return this.service.removeBoost(id);
  }

  @Delete(':id/top-listing')
  @ApiOperation({ summary: 'Remove top listing status' })
  @ApiResponse({
    status: 200,
    description: 'Top listing status removed successfully'
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  async removeTopListing(@Param('id') id: string) {
    return this.service.removeTopListing(id);
  }

  @Get('boosted')
  @ApiOperation({ summary: 'Get boosted properties' })
  @ApiResponse({
    status: 200,
    description: 'Boosted properties retrieved successfully'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Properties per page'
  })
  async getBoostedProperties(
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);
    return this.service.getBoostedProperties(p, l);
  }

  @Get('top-listings')
  @ApiOperation({ summary: 'Get top listings' })
  @ApiResponse({
    status: 200,
    description: 'Top listings retrieved successfully'
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getTopListings(
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);
    return this.service.getTopListings(p, l);
  }

  @Get('enhanced')
  @ApiOperation({
    summary: 'Get enhanced property listing (with boost priority ordering)',
    description:
      'Get properties sorted by boost status and priority. Top listings appear first, followed by boosted properties, then regular listings.'
  })
  @ApiResponse({
    status: 200,
    description: 'Enhanced property listing retrieved successfully'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number (starting from 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Properties per page (1-50, default: 10)'
  })
  async getEnhancedListing(
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.service.findAllEnhanced(p, l);
  }

  private resolveOwnerId(req: any, ownerIdFromQuery?: string): string {
    const resolved =
      req?.user?.id ??
      (req?.headers?.['x-user-id'] as string) ??
      ownerIdFromQuery;
    if (!resolved) {
      throw new BadRequestException(
        'ownerId is required (from auth, x-user-id header, or ?ownerId= query)'
      );
    }
    return resolved;
  }
}
