import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdReportService } from './services/ad-report.service';
import { CreateAdReportDto, ResolveAdReportDto, DismissAdReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/decorators/current-user.decorator';

@ApiTags('Ad Reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ad-reports')
export class AdReportController {
  constructor(private readonly service: AdReportService) {}

  @Post(':adId')
  @ApiOperation({ summary: 'Report an ad' })
  @ApiResponse({ status: 201, description: 'Ad report created successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  @ApiResponse({ status: 400, description: 'Invalid report data' })
  @ApiParam({
    name: 'adId',
    example: '22222222-2222-2222-2222-222222222222',
    description: 'Ad UUID to report',
  })
  @ApiBody({
    description: 'Report payload',
    type: CreateAdReportDto,
    examples: {
      'fake-listing': {
        summary: 'Report fake listing',
        value: {
          report_type: 'FAKE_LISTING',
          description:
            'Photos appear to be stolen from another listing. Contact details seem suspicious.',
          is_anonymous: false,
          severity: 4,
          evidence: {
            links: ['https://originallisting.com/xyz'],
            screenshots: ['evidence1.jpg', 'evidence2.jpg'],
          },
        },
      },
      'inappropriate-content': {
        summary: 'Report inappropriate content',
        value: {
          report_type: 'INAPPROPRIATE_CONTENT',
          description:
            'Ad contains inappropriate language and discriminatory statements',
          is_anonymous: true,
          severity: 3,
          evidence: {
            description_excerpt: 'Screenshot of offensive content',
            reported_sections: ['description', 'title'],
          },
        },
      },
    },
  })
  async create(
    @Param('adId') adId: string,
    @Body() dto: CreateAdReportDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(adId, dto, user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'List reports (admin)' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin access required' })
  @ApiQuery({
    name: 'page',
    required: false,
    example: 1,
    description: 'Page number (starting from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Number of reports per page (1-50)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'PENDING',
    description: 'Filter by report status',
    enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'],
  })
  @ApiQuery({
    name: 'report_type',
    required: false,
    example: 'FAKE_LISTING',
    description: 'Filter by report type',
    enum: [
      'FAKE_LISTING',
      'INAPPROPRIATE_CONTENT',
      'WRONG_LOCATION',
      'OVERPRICED',
      'SPAM',
      'OTHER',
    ],
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    example: 4,
    description: 'Filter by severity level (1-5)',
    enum: [1, 2, 3, 4, 5],
  })
  async list(@Query('page') page = '1', @Query('limit') limit = '10', @Query('status') status?: string) {
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
          },
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
          },
        },
        avg_severity: { type: 'number', example: 3.2 },
      },
    },
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
    description: 'Report UUID',
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
    description: 'Report UUID to resolve',
  })
  @ApiBody({
    description: 'Resolution payload',
    type: ResolveAdReportDto,
    examples: {
      'ad-removed': {
        summary: 'Resolve by removing ad',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes:
            'Verified the report. Ad was indeed fake and has been removed from the platform.',
          resolution_action: 'AD_REMOVED',
        },
      },
    },
  })
  async resolve(
    @Param('id') id: string,
    @Body() body: ResolveAdReportDto,
    @CurrentUser() user: any,
  ) {
    const reviewerId = body?.reviewer_id || user?.id;
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
    description: 'Report UUID to dismiss',
  })
  @ApiBody({
    description: 'Dismiss payload',
    type: DismissAdReportDto,
    examples: {
      'insufficient-evidence': {
        summary: 'Dismiss due to insufficient evidence',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          resolution_notes:
            'After investigation, insufficient evidence found to support the claim.',
        },
      },
    },
  })
  async dismiss(
    @Param('id') id: string,
    @Body() body: DismissAdReportDto,
    @CurrentUser() user: any,
  ) {
    const reviewerId = body?.reviewer_id || user?.id;
    return this.service.dismiss(id, reviewerId, body?.resolution_notes);
  }
}
