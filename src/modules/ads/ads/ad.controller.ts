import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { AdService } from './services/ad.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { AdResponseDto } from './dto/ad-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth';

@ApiTags('ads')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ads')
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new ad' })
  @ApiResponse({ status: 201, description: 'Ad created successfully', type: AdResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({
    description: 'New ad payload',
    type: CreateAdDto,
    examples: {
      'electronics-ad': {
        summary: 'iPhone for sale with complete details',
        value: {
          title: 'iPhone 14 Pro Max - Excellent Condition',
          description: 'Brand new iPhone 14 Pro Max in excellent condition. 256GB storage, Deep Purple color. Includes original box, charger, and unused earphones. Never dropped, screen protector applied since day one.',
          category_id: '550e8400-e29b-41d4-a716-446655440000',
          price: 999.99,
          price_unit: 'USD',
          is_negotiable: true,
          status: 'AVAILABLE',
          address_line: '123 Main Street, Apt 4B',
          city: 'New York',
          district: 'Manhattan',
          state: 'New York',
          postal_code: '10001',
          country: 'United States',
          latitude: 40.7128,
          longitude: -74.0060,
          contact_name: 'John Doe',
          contact_phone: '+1-555-123-4567',
          contact_email: 'john.doe@example.com',
          is_published: false,
          slug: 'iphone-14-pro-max-excellent-condition-nyc',
          meta_description: 'Buy iPhone 14 Pro Max in excellent condition. Located in New York City.',
          meta_keywords: 'iPhone 14 Pro Max, smartphone, Apple, 256GB, Deep Purple, NYC, electronics'
        }
      },
      'boosted-ad': {
        summary: 'Ad with boost features (subscription)',
        description: 'Example of creating an ad with boost and top listing features for premium subscribers',
        value: {
          title: 'Premium MacBook Pro - Boosted Listing',
          description: 'Latest MacBook Pro with M2 chip. Perfect for professionals. Boosted listing for maximum visibility.',
          category_id: '550e8400-e29b-41d4-a716-446655440000',
          price: 1899.99,
          price_unit: 'USD',
          is_negotiable: false,
          status: 'AVAILABLE',
          city: 'San Francisco',
          district: 'SOMA',
          state: 'California',
          postal_code: '94105',
          country: 'United States',
          contact_name: 'Premium Seller',
          contact_phone: '+1-555-PREMIUM',
          contact_email: 'premium@example.com',
          is_boosted: true,
          boost_duration_days: 30,
          boost_type: 'PREMIUM',
          boost_priority: 5,
          is_top_listing: true,
          top_listing_duration_days: 7,
          is_published: true,
          is_premium: true,
          is_featured: true
        }
      },
      'basic-ad': {
        summary: 'Simple ad without boost features',
        value: {
          title: 'Used Bicycle - Good Condition',
          description: 'Mountain bike in good condition. Perfect for weekend rides.',
          category_id: '550e8400-e29b-41d4-a716-446655440001',
          price: 150.00,
          price_unit: 'USD',
          city: 'Austin',
          district: 'Downtown',
          state: 'Texas',
          postal_code: '78701',
          country: 'United States',
          contact_phone: '+1-555-0199',
          is_published: false
        }
      }
    }
  })
  async create(
    @Body() createAdDto: CreateAdDto,
    @CurrentUser() user: any,
    @Request() req: any
  ) {
    let userId = user.id;
    if (!userId) {
      console.error('No user ID found. User object:', user, 'Request user:', req.user);
      throw new BadRequestException('User ID is required. Please ensure you are properly authenticated.');
    }

    console.log('Using userId:', userId);
    return this.adService.create(createAdDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List ads (paginated)' })
  @ApiResponse({ status: 200, description: 'Ads retrieved successfully' })
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
    description: 'Number of ads per page (1-50)'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    example: 'AVAILABLE',
    description: 'Filter by ad status'
  })
  @ApiQuery({ 
    name: 'category_id', 
    required: false, 
    description: 'Filter by category ID'
  })
  @ApiQuery({ 
    name: 'city', 
    required: false, 
    description: 'Filter by city'
  })
  @ApiQuery({
    name: 'approval_status',
    required: false,
    example: 'UNDER RIVEW',
    description: 'Filter by approval status',
    enum: ['UNDER RIVEW', 'APPROVAL', 'REJECTED']
  })
  async list(
    @Query('page') page = '1', 
    @Query('limit') limit = '10',
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('approval_status') approval_status?: string,
    @Query('category_id') category_id?: string,
    @Query('city') city?: string,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.adService.findAll(p, l, { status, category_id, city, approval_status }, user.id);
  }

  @Get('my-favorities-ads')
  @ApiOperation({ summary: 'List favorities ads (paginated)' })
  @ApiResponse({ status: 200, description: 'Ads retrieved successfully' })
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
    description: 'Number of ads per page (1-50)'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'AVAILABLE',
    description: 'Filter by ad status'
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    description: 'Filter by category ID'
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Filter by city'
  })
  @ApiQuery({
    name: 'approval_status',
    required: false,
    example: 'UNDER RIVEW',
    description: 'Filter by approval status',
    enum: ['UNDER RIVEW', 'APPROVAL', 'REJECTED']
  })
  async myfavoritieslist(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('approval_status') approval_status?: string,
    @Query('category_id') category_id?: string,
    @Query('city') city?: string,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.adService.findMyFavorites(p, l, { status, category_id, city, approval_status }, user.id);
  }

  @Get(['my-ads', 'me'])
  @ApiOperation({ summary: 'Get current user ads (paginated)' })
  @ApiResponse({ status: 200, description: 'User ads retrieved successfully' })
  @ApiQuery({ 
    name: 'ownerId', 
    required: false, 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Owner ID (optional if authenticated)'
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
    description: 'Number of ads per page (1-50)'
  })
  async myList(
    @Request() req: any,
    @Query('ownerId') ownerId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const userId = this.resolveOwnerId(req, ownerId);
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.adService.myAds(userId, p, l);
  }

  @Get('boosted')
  @ApiOperation({ summary: 'Get boosted ads' })
  @ApiResponse({ status: 200, description: 'Boosted ads retrieved successfully' })
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
    description: 'Ads per page'
  })
  async getBoostedAds(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.adService.getBoostedAds(p, l);
  }

  @Get('top-listings')
  @ApiOperation({ summary: 'Get top listings' })
  @ApiResponse({ status: 200, description: 'Top listings retrieved successfully' })
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
    description: 'Ads per page'
  })
  async getTopListings(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.adService.getTopListings(p, l);
  }

  @Get('enhanced')
  @ApiOperation({ 
    summary: 'Get enhanced ad listing (with boost priority ordering)',
    description: 'Get ads sorted by boost status and priority. Top listings appear first, followed by boosted ads, then regular listings.'
  })
  @ApiResponse({ status: 200, description: 'Enhanced ads retrieved successfully' })
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
    description: 'Ads per page (1-50, default: 10)'
  })
  async getEnhancedListing(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.adService.findAllEnhanced(p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ad by ID' })
  @ApiResponse({ status: 200, description: 'Ad retrieved successfully', type: AdResponseDto })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.adService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ad' })
  @ApiResponse({ status: 200, description: 'Ad updated successfully', type: AdResponseDto })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - not ad owner' })
  @ApiParam({ 
    name: 'id', 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Ad UUID'
  })
  @ApiBody({
    description: 'Ad fields to update',
    type: UpdateAdDto,
    examples: {
      'basic-update': {
        summary: 'Update basic ad information',
        value: {
          title: 'Updated iPhone 14 Pro Max - Price Reduced!',
          description: 'Updated description with price reduction details',
          price: 899.99,
          status: 'AVAILABLE',
          is_published: true,
        },
      },
      'price-update': {
        summary: 'Update only price',
        value: {
          price: 799.99,
          is_negotiable: true,
        },
      },
      'status-update': {
        summary: 'Update ad status',
        value: {
          status: 'SOLD',
        },
      },
      'contact-update': {
        summary: 'Update contact information',
        value: {
          contact_name: 'New Contact Person',
          contact_phone: '+1-555-9999',
          contact_email: 'newcontact@example.com',
        },
      },
    },
  })
  async update(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto) {
    return this.adService.update(id, updateAdDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete ad' })
  @ApiResponse({ status: 200, description: 'Ad deleted successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  async remove(@Param('id') id: string) {
    return this.adService.delete(id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish ad' })
  @ApiResponse({ status: 200, description: 'Ad published successfully' })
  async publish(@Param('id') id: string) {
    return this.adService.publish(id);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish ad' })
  @ApiResponse({ status: 200, description: 'Ad unpublished successfully' })
  async unpublish(@Param('id') id: string) {
    return this.adService.unpublish(id);
  }

  @Post(':id/boost')
  @ApiOperation({
    summary: 'Boost ad (subscription feature)',
    description: 'Boost an ad to increase its visibility in search results. Requires active subscription plan.'
  })
  @ApiResponse({ status: 200, description: 'Ad boosted successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  @ApiResponse({ status: 402, description: 'Payment required - insufficient subscription credits' })
  @ApiParam({ 
    name: 'id', 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Ad ID to boost'
  })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    example: 'PREMIUM', 
    description: 'Boost type',
    enum: ['PREMIUM', 'FEATURED', 'URGENT']
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
    example: 1, 
    description: 'Boost priority level (1-10). Higher number = more visibility. Default: 1',
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  })
  async boostAd(
    @Param('id') id: string,
    @Query('type') type = 'PREMIUM',
    @Query('duration') duration = '30',
    @Query('priority') priority = '1',
  ) {
    const durationDays = parseInt(String(duration), 10) || 30;
    const priorityNum = parseInt(String(priority), 10) || 1;
    return this.adService.boostAd(id, type, durationDays, priorityNum);
  }

  @Post(':id/make-top-listing')
  @ApiOperation({
    summary: 'Make ad a top listing (premium subscription feature)',
    description: 'Promote ad to top listing section for maximum visibility. Requires premium subscription.'
  })
  @ApiResponse({ status: 200, description: 'Ad promoted to top listing successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  @ApiResponse({ status: 402, description: 'Payment required - premium subscription required' })
  @ApiParam({ 
    name: 'id', 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Ad ID to promote to top listing'
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
    @Query('duration') duration = '7',
  ) {
    const durationDays = parseInt(String(duration), 10) || 7;
    return this.adService.makeTopListing(id, durationDays);
  }

  @Delete(':id/boost')
  @ApiOperation({ summary: 'Remove ad boost' })
  @ApiResponse({ status: 200, description: 'Ad boost removed successfully' })
  async removeBoost(@Param('id') id: string) {
    return this.adService.removeBoost(id);
  }

  @Delete(':id/top-listing')
  @ApiOperation({ summary: 'Remove top listing' })
  @ApiResponse({ status: 200, description: 'Top listing removed successfully' })
  async removeTopListing(@Param('id') id: string) {
    return this.adService.removeTopListing(id);
  }

  @Post(':id/contact')
  @ApiOperation({ summary: 'Increment contact count' })
  @ApiResponse({ status: 200, description: 'Contact count incremented' })
  async incrementContactCount(@Param('id') id: string) {
    await this.adService.incrementContactCount(id);
    return { success: true };
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Increment click count' })
  @ApiResponse({ status: 200, description: 'Click count incremented' })
  async incrementClickCount(@Param('id') id: string) {
    await this.adService.incrementClickCount(id);
    return { success: true };
  }

  private resolveOwnerId(req: any, ownerIdFromQuery?: string): string {
    if (ownerIdFromQuery) {
      return ownerIdFromQuery;
    }
    return req.user?.id ?? req.user?.sub;
  }
}
