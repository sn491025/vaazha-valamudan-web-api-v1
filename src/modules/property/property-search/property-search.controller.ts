import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { PropertySearchService } from './services/property-search.service';
import { PropertyFilterDto } from './dto/property-filter.dto';
import { PropertyService } from '../properties/services/property.service';
import { PropertySummaryByDistrictDto } from './dto/property-summary-by-district.dto';

@ApiTags('Property Search')
@Controller('properties/search')
export class PropertySearchController {
  constructor(
    private readonly service: PropertySearchService,
    private readonly propService: PropertyService
  ) {}

  @Get('list')
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
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('listing_type') listing_type?: string
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.propService.findAll(p, l, {
      status,
      listing_type,
      approval_status: 'APPROVED'
    });
  }

  @Post()
  @ApiOperation({ summary: 'Search properties with advanced filters' })
  @ApiBody({
    description: 'Search filters',
    type: PropertyFilterDto,
    examples: {
      sample: {
        summary: 'Search by city and price range',
        value: {
          city: 'Metropolis',
          min_price: 50000,
          max_price: 150000,
          sort: 'price_asc',
          page: 1,
          limit: 12
        }
      }
    }
  })
  async search(@Body() filters: PropertyFilterDto) {
    return this.service.search(filters);
  }

  @Get('find-property/:id')
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
  async findOne(@Param('id') id: string) {
    return this.propService.findOne(id);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', required: true, example: 'down' })
  async suggestions(@Query('q') q: string) {
    return this.service.suggestions(q);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete location/keywords' })
  @ApiQuery({ name: 'q', required: true, example: 'met' })
  async autocomplete(@Query('q') q: string) {
    return this.service.autocomplete(q);
  }

  @Get('filters')
  @ApiOperation({ summary: 'Get available search filters' })
  async filters() {
    return this.service.availableFilters();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby properties' })
  @ApiQuery({ name: 'lat', required: true, example: 40.712776 })
  @ApiQuery({ name: 'lng', required: true, example: -74.005974 })
  @ApiQuery({ name: 'radiusKm', required: false, example: 5 })
  async nearby(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm?: string
  ) {
    const la = Number(lat);
    const ln = Number(lng);
    const r = radiusKm != null ? Number(radiusKm) : 5;
    return this.service.nearby(la, ln, r);
  }

  @Get('district-summary')
  @ApiOperation({ summary: 'district summary summary' })
  @ApiQuery({ name: 'district', required: false, example: 'Downtown' })
  @ApiOkResponse({
    type: PropertySummaryByDistrictDto,
    isArray: true,
    description: 'District-wise property summary'
  })
  async getpropertysummarybydistrict(@Query('district') district?: string) {
    return this.service.getPropertySummaryByDistrict(district);
  }
}
