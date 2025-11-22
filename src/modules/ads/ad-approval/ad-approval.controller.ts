import {
  Body,
  Controller,
  Get,
  Param,
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
import { AdApprovalService } from './services/ad-approval.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Ad Approvals')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('ad-approvals')
export class AdApprovalController {
  constructor(private readonly service: AdApprovalService) {}

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

  @Get('by-ad/:adId')
  @ApiOperation({ summary: 'Get approval by ad ID' })
  @ApiResponse({
    status: 200,
    description: 'Approval details retrieved successfully'
  })
  @ApiResponse({ status: 404, description: 'Approval not found for this ad' })
  @ApiParam({
    name: 'adId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Ad UUID to get approval details for'
  })
  async getByAd(@Param('adId') adId: string) {
    return this.service.getByAdId(adId);
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

  @Put('ad/:adId/approve')
  @ApiOperation({ summary: 'Approve ad' })
  @ApiResponse({ status: 200, description: 'Ad approved successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  @ApiResponse({ status: 400, description: 'Ad already processed' })
  @ApiParam({
    name: 'adId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Ad UUID to approve'
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
          example: 'Ad meets all requirements and is ready to publish'
        }
      }
    },
    examples: {
      'basic-approval': {
        summary: 'Simple approval',
        value: { reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }
      },
      'approval-with-comments': {
        summary: 'Approval with detailed comments',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          comments: 'High quality images and accurate ad content.'
        }
      }
    }
  })
  async approve(
    @Param('adId') adId: string,
    @Body() body: { reviewer_id: string; comments?: string }
  ) {
    // Map comments -> admin_notes for existing service method
    return this.service.approveAd(adId, body.reviewer_id, {
      admin_notes: body?.comments
    });
  }

  @Put('ad/:adId/reject')
  @ApiOperation({ summary: 'Reject ad' })
  @ApiResponse({ status: 200, description: 'Ad rejected successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  @ApiResponse({ status: 400, description: 'Ad already processed' })
  @ApiParam({
    name: 'adId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Ad UUID to reject'
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
        rejection_reason: {
          type: 'string',
          example: 'Contains inappropriate content'
        },
        comments: {
          type: 'string',
          example: 'Please remove inappropriate images'
        }
      }
    },
    examples: {
      'policy-violation': {
        summary: 'Reject due to policy violation',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          rejection_reason: 'Inappropriate content',
          comments: 'Certain images violate our content policy'
        }
      },
      duplicate: {
        summary: 'Reject duplicate ad',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          rejection_reason: 'Duplicate listing',
          comments: 'This ad appears to duplicate an existing active ad'
        }
      }
    }
  })
  async reject(
    @Param('adId') adId: string,
    @Body()
    body: { reviewer_id: string; rejection_reason: string; comments?: string }
  ) {
    return this.service.rejectAd(adId, body.reviewer_id, {
      rejection_reason: body.rejection_reason,
      admin_notes: body?.comments
    });
  }

  @Put('ad/:adId/request-changes')
  @ApiOperation({ summary: 'Request changes for ad' })
  @ApiResponse({ status: 200, description: 'Changes requested successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  @ApiResponse({ status: 400, description: 'Ad already processed' })
  @ApiParam({
    name: 'adId',
    example: '11111111-1111-1111-1111-111111111111',
    description: 'Ad UUID to request changes for'
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
          example: 'Update title and remove watermarked images'
        },
        comments: {
          type: 'string',
          example: 'Please ensure photos are original and high-quality'
        }
      }
    },
    examples: {
      'improve-photos': {
        summary: 'Request better photos',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          required_changes:
            'Upload higher quality original photos without watermarks',
          comments: 'Current photos appear low resolution and have watermarks'
        }
      },
      'update-description': {
        summary: 'Request description update',
        value: {
          reviewer_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          required_changes: 'Provide more details about amenities and location',
          comments: 'Add info on nearby schools, hospitals, and transport'
        }
      }
    }
  })
  async requestChanges(
    @Param('adId') adId: string,
    @Body()
    body: { reviewer_id: string; required_changes: string; comments?: string }
  ) {
    return this.service.requestChanges(adId, body.reviewer_id, {
      changes_requested: body.required_changes,
      admin_notes: body?.comments
    });
  }
}
