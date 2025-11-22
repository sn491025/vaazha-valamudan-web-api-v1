import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PropertyReportService } from './services/property-report.service';
import { CreatePropertyReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';


@ApiTags('Property Reports')
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller('property-reports')
export class PropertyReportController {
  constructor(private readonly service: PropertyReportService) {}

  @Post(':propertyId')
  @ApiOperation({ summary: 'Report a property' })
  @ApiResponse({ status: 201, description: 'Property report created successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 400, description: 'Invalid report data' })
  @ApiParam({ 
    name: 'propertyId', 
    example: '22222222-2222-2222-2222-222222222222',
    description: 'Property UUID to report'
  })
  @ApiBody({
    description: 'Report payload',
    type: CreatePropertyReportDto,
    examples: {
      'fake-listing': {
        summary: 'Report fake listing',
        value: {
          report_type: 'FAKE_LISTING',
          description: 'Photos appear to be stolen from another property listing. The contact details seem suspicious.',
          is_anonymous: false,
          severity: 4,
          evidence: { 
            links: ['https://originallistin g.com/property123'],
            screenshots: ['evidence1.jpg', 'evidence2.jpg']
          },
        },
      },
      'inappropriate-content': {
        summary: 'Report inappropriate content',
        value: {
          report_type: 'INAPPROPRIATE_CONTENT',
          description: 'Property description contains inappropriate language and discriminatory statements',
          is_anonymous: true,
          severity: 3,
          evidence: { 
            description_excerpt: 'Screenshot of offensive content',
            reported_sections: ['description', 'amenities']
          },
        },
      },
      'wrong-location': {
        summary: 'Report wrong location',
        value: {
          report_type: 'WRONG_LOCATION',
          description: 'The property is not located at the address mentioned. I visited the location and it\'s a different building.',
          is_anonymous: false,
          severity: 5,
          evidence: { 
            actual_address: '456 Different Street, Another City',
            photos: ['actual_location.jpg'],
            gps_coordinates: { lat: 40.7589, lng: -73.9851 }
          },
        },
      },
      'overpriced': {
        summary: 'Report overpriced property',
        value: {
          report_type: 'OVERPRICED',
          description: 'Property is significantly overpriced compared to similar properties in the area',
          is_anonymous: false,
          severity: 2,
          evidence: { 
            comparable_properties: [
              { id: 'prop1', price: 250000, url: 'https://example.com/prop1' },
              { id: 'prop2', price: 265000, url: 'https://example.com/prop2' }
            ],
            market_analysis: 'Average price for similar properties is 30% lower'
          },
        },
      },
      'spam': {
        summary: 'Report spam/duplicate',
        value: {
          report_type: 'SPAM',
          description: 'This is a duplicate listing. The same property is posted multiple times with slight variations.',
          is_anonymous: true,
          severity: 3,
          evidence: { 
            duplicate_listings: [
              'prop-id-1111-2222-3333-4444',
              'prop-id-5555-6666-7777-8888'
            ]
          },
        },
      },
    },
  })
  async create(
    @Param('propertyId') propertyId: string,
    @Body() dto: CreatePropertyReportDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(propertyId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List reports (admin)' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
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
    description: 'Number of reports per page (1-50)'
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    example: 'PENDING',
    description: 'Filter by report status',
    enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED']
  })
  @ApiQuery({ 
    name: 'report_type', 
    required: false, 
    example: 'FAKE_LISTING',
    description: 'Filter by report type',
    enum: ['FAKE_LISTING', 'INAPPROPRIATE_CONTENT', 'WRONG_LOCATION', 'OVERPRICED', 'SPAM', 'OTHER']
  })
  @ApiQuery({ 
    name: 'severity', 
    required: false, 
    example: 4,
    description: 'Filter by severity level (1-5)',
    enum: [1, 2, 3, 4, 5]
  })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.service.list(p, l, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get report statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Report statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 75 },
        by_status: {
          type: 'object',
          properties: {
            pending: { type: 'number', example: 15 },
            under_review: { type: 'number', example: 10 },
            resolved: { type: 'number', example: 45 },
            dismissed: { type: 'number', example: 5 },
          }
        },
        by_type: {
          type: 'object',
          properties: {
            fake_listing: { type: 'number', example: 20 },
            inappropriate_content: { type: 'number', example: 15 },
            wrong_location: { type: 'number', example: 10 },
            overpriced: { type: 'number', example: 8 },
            spam: { type: 'number', example: 12 },
            other: { type: 'number', example: 10 },
          }
        },
        avg_severity: { type: 'number', example: 3.2 },
      }
    }
  })
  async stats() {
    return this.service.stats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report details (admin)' })
  @ApiResponse({ status: 200, description: 'Report details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiParam({ 
    name: 'id', 
    example: '33333333-3333-3333-3333-333333333333',
    description: 'Report UUID'
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Put(':id/resolve')
  @ApiOperation({ summary: 'Resolve a report (admin)' })
  @ApiResponse({ status: 200, description: 'Report resolved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 400, description: 'Report already processed' })
  @ApiParam({ 
    name: 'id', 
    example: '33333333-3333-3333-3333-333333333333',
    description: 'Report UUID to resolve'
  })
  @ApiBody({
    description: 'Resolution payload',
    schema: {
      type: 'object',
      properties: {
        reviewer_id: { type: 'string', format: 'uuid', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
        resolution_notes: { type: 'string', example: 'Investigated and took appropriate action' },
        resolution_action: { type: 'string', example: 'PROPERTY_REMOVED', enum: ['PROPERTY_REMOVED', 'PROPERTY_MODIFIED', 'WARNING_ISSUED', 'USER_SUSPENDED', 'NO_ACTION'] }
      }
    },
    examples: {
      'property-removed': {
        summary: 'Resolve by removing property',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes: 'Verified the report. Property was indeed fake and has been removed from the platform.',
          resolution_action: 'PROPERTY_REMOVED',
        },
      },
      'property-modified': {
        summary: 'Resolve by modifying property',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes: 'Contacted property owner. Inappropriate content has been removed and description updated.',
          resolution_action: 'PROPERTY_MODIFIED',
        },
      },
      'warning-issued': {
        summary: 'Resolve by issuing warning',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes: 'Minor pricing issue identified. Warning issued to property owner to adjust pricing.',
          resolution_action: 'WARNING_ISSUED',
        },
      },
    },
  })
  async resolve(
    @Param('id') id: string,
    @Body() body: { reviewer_id?: string; resolution_notes?: string; resolution_action?: string },
    @CurrentUser() user: any,
  ) {
    const reviewerId = body?.reviewer_id || user.id;
    return this.service.resolve(id, reviewerId, body?.resolution_notes, body?.resolution_action);
  }

  @Put(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss a report (admin)' })
  @ApiResponse({ status: 200, description: 'Report dismissed successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 400, description: 'Report already processed' })
  @ApiParam({ 
    name: 'id', 
    example: '33333333-3333-3333-3333-333333333333',
    description: 'Report UUID to dismiss'
  })
  @ApiBody({
    description: 'Dismiss payload',
    schema: {
      type: 'object',
      properties: {
        reviewer_id: { type: 'string', format: 'uuid', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
        resolution_notes: { type: 'string', example: 'Insufficient evidence to take action' }
      }
    },
    examples: {
      'insufficient-evidence': {
        summary: 'Dismiss due to insufficient evidence',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes: 'After investigation, insufficient evidence found to support the claim. Property appears legitimate.',
        },
      },
      'false-report': {
        summary: 'Dismiss false report',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes: 'Report appears to be false or malicious. No issues found with the property listing.',
        },
      },
      'already-resolved': {
        summary: 'Dismiss already resolved issue',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes: 'Issue was already resolved in a previous update. Property now complies with all guidelines.',
        },
      },
    },
  })
  async dismiss(
    @Param('id') id: string,
    @Body() body: { reviewer_id?: string; resolution_notes?: string },
    @CurrentUser() user: any,
  ) {
    const reviewerId = body?.reviewer_id || user.id;
    return this.service.dismiss(id, reviewerId, body?.resolution_notes);
  }
}