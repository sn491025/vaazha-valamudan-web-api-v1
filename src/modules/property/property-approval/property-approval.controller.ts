import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PropertyApprovalService } from './services/property-approval.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@ApiTags('Property Approvals')
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
@Controller('property-approvals')
export class PropertyApprovalController {
  constructor(private readonly service: PropertyApprovalService) {}

  @Get()
  @ApiOperation({ summary: 'List approval requests' })
  @ApiResponse({
    status: 200,
    description: 'Approval requests retrieved successfully'
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions'
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
    description: 'Number of requests per page (1-50)'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'PENDING',
    description: 'Filter by approval status',
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED']
  })
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.service.list(p, l, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get approval statistics' })
  @ApiResponse({
    status: 200,
    description: 'Approval statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 150 },
        pending: { type: 'number', example: 25 },
        approved: { type: 'number', example: 100 },
        rejected: { type: 'number', example: 15 },
        changes_requested: { type: 'number', example: 10 }
      }
    }
  })
  async stats() {
    return this.service.stats();
  }

  @Get('by-property/:propertyId')
  @ApiOperation({ summary: 'Get approval by property ID' })
  @ApiResponse({
    status: 200,
    description: 'Approval details retrieved successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Approval not found for this property'
  })
  @ApiParam({
    name: 'propertyId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Property UUID to get approval details for'
  })
  async getByProperty(@Param('propertyId') propertyId: string) {
    return this.service.getByPropertyId(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval details' })
  @ApiResponse({
    status: 200,
    description: 'Approval details retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  @ApiParam({
    name: 'id',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Approval UUID'
  })
  async get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Put('property/:propertyId/approve')
  @ApiOperation({ summary: 'Approve property' })
  @ApiResponse({ status: 200, description: 'Property approved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 400, description: 'Property already processed' })
  @ApiParam({
    name: 'propertyId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Property UUID to approve'
  })
  @ApiBody({
    description: 'Approval payload',
    schema: {
      type: 'object',
      required: ['reviewer_id'],
      properties: {
        reviewer_id: {
          type: 'string',
          format: 'uuid',
          example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        },
        comments: {
          type: 'string',
          example:
            'Property meets all requirements and looks good for publication'
        }
      }
    },
    examples: {
      'basic-approval': {
        summary: 'Simple approval',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        }
      },
      'approval-with-comments': {
        summary: 'Approval with detailed comments',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          comments:
            'Excellent property listing with all required documentation. Photos are high quality and description is accurate.'
        }
      }
    }
  })
  async approve(
    @Param('propertyId') propertyId: string,
    @Body() body: { reviewer_id: string; comments?: string }
  ) {
    return this.service.approveProperty(
      propertyId,
      body.reviewer_id,
      body?.comments
    );
  }

  @Put('property/:propertyId/reject')
  @ApiOperation({ summary: 'Reject property' })
  @ApiResponse({ status: 200, description: 'Property rejected successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 400, description: 'Property already processed' })
  @ApiParam({
    name: 'propertyId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Property UUID to reject'
  })
  @ApiBody({
    description: 'Rejection payload',
    schema: {
      type: 'object',
      required: ['reviewer_id', 'rejection_reason'],
      properties: {
        reviewer_id: {
          type: 'string',
          format: 'uuid',
          example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        },
        rejection_reason: { type: 'string', example: 'Incomplete information' },
        comments: {
          type: 'string',
          example: 'Please add ownership documents and better quality photos'
        }
      }
    },
    examples: {
      'missing-documents': {
        summary: 'Reject due to missing documents',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          rejection_reason: 'Missing required documents',
          comments:
            'Please provide ownership deed, NOC from society, and recent utility bills'
        }
      },
      'poor-quality': {
        summary: 'Reject due to poor quality listing',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          rejection_reason: 'Poor quality photos and description',
          comments:
            'Photos are blurry and description lacks important details about the property amenities'
        }
      },
      'suspicious-listing': {
        summary: 'Reject suspicious listing',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          rejection_reason: 'Suspicious or fraudulent listing',
          comments:
            'Photos appear to be copied from another listing. Please verify ownership and provide original photos'
        }
      }
    }
  })
  async reject(
    @Param('propertyId') propertyId: string,
    @Body()
    body: { reviewer_id: string; rejection_reason: string; comments?: string }
  ) {
    return this.service.rejectProperty(
      propertyId,
      body.reviewer_id,
      body.rejection_reason,
      body?.comments
    );
  }

  @Put('property/:propertyId/request-changes')
  @ApiOperation({ summary: 'Request changes for property' })
  @ApiResponse({ status: 200, description: 'Changes requested successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @ApiResponse({ status: 400, description: 'Property already processed' })
  @ApiParam({
    name: 'propertyId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Property UUID to request changes for'
  })
  @ApiBody({
    description: 'Change request payload',
    schema: {
      type: 'object',
      required: ['reviewer_id', 'required_changes'],
      properties: {
        reviewer_id: {
          type: 'string',
          format: 'uuid',
          example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        },
        required_changes: {
          type: 'string',
          example: 'Add floor plan and utility bills'
        },
        comments: {
          type: 'string',
          example:
            'We need these documents to complete the verification process'
        }
      }
    },
    examples: {
      'missing-floor-plan': {
        summary: 'Request floor plan',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          required_changes: 'Please add floor plan diagram',
          comments:
            'Floor plan is required to help buyers understand the layout better'
        }
      },
      'improve-photos': {
        summary: 'Request better photos',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          required_changes: 'Please upload higher quality photos of all rooms',
          comments:
            'Current photos are too dark. Please take photos with better lighting and include all rooms including kitchen and bathrooms'
        }
      },
      'update-description': {
        summary: 'Request description update',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          required_changes:
            'Please provide more detailed description including nearby amenities',
          comments:
            'Add information about nearby schools, hospitals, public transport, and shopping centers'
        }
      }
    }
  })
  async requestChanges(
    @Param('propertyId') propertyId: string,
    @Body()
    body: { reviewer_id: string; required_changes: string; comments?: string }
  ) {
    return this.service.requestChangesForProperty(
      propertyId,
      body.reviewer_id,
      body.required_changes,
      body?.comments
    );
  }
}