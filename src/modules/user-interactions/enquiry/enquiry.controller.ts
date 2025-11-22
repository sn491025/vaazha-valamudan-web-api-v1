import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { EnquiryService } from './services/enquiry.service';
import { CreateEnquiryDto } from './dto';
import { EntityType } from '../saved-search/dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';


@ApiTags('User Interactions - Enquiries')
@Controller('user-interactions/enquiries')
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
export class EnquiryController {
  constructor(private readonly enquiryService: EnquiryService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new enquiry',
    description: 'Submit an enquiry about a property or ad. User authentication is optional.'
  })
  @ApiBody({
    description: 'Enquiry creation payload',
    type: CreateEnquiryDto,
    examples: {
      propertyEnquiry: {
        summary: 'Property viewing enquiry',
        value: {
          entity_type: 'property',
          entity_id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1-555-0123',
          message: 'I am interested in viewing this 3BR apartment. Are weekends available for viewing?',
          metadata: {
            preferred_viewing_time: 'weekend',
            budget: '400000-500000',
            move_in_date: '2024-03-01',
            financing_pre_approved: true
          }
        }
      },
      adEnquiry: {
        summary: 'Vehicle ad enquiry',
        value: {
          entity_type: 'ad',
          entity_id: '987f6543-a21b-45c6-d789-123456789abc',
          name: 'Sarah Johnson',
          email: 'sarah.j@gmail.com',
          phone: '+1-555-0456',
          message: 'Is this Toyota Camry still available? Can I schedule a test drive?',
          metadata: {
            preferred_contact_time: 'evening',
            financing_needed: false,
            trade_in_available: true,
            test_drive_requested: true
          }
        }
      },
      businessEnquiry: {
        summary: 'Business partnership enquiry',
        value: {
          entity_type: 'ad',
          entity_id: '456b7890-c12d-34e5-f678-901234567890',
          name: 'Michael Chen',
          email: 'michael.chen@company.com', 
          phone: '+1-555-0789',
          message: 'We are interested in your business proposal. Could we schedule a meeting to discuss partnership opportunities?',
          metadata: {
            company_name: 'Tech Solutions Inc',
            meeting_preference: 'in-person',
            budget_range: '50000-100000',
            timeline: '30-60 days'
          }
        }
      }
    }
  })
  async create(@Body() createEnquiryDto: CreateEnquiryDto, @Request() req: any) {
    const userId = req.user?.id;
    return this.enquiryService.create(createEnquiryDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all enquiries (admin/agent only)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'entity_type', required: false, enum: EntityType })
  @ApiQuery({ name: 'entity_id', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('entity_type') entityType?: EntityType,
    @Query('entity_id') entityId?: string,
    @Query('status') status?: string,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);

    return this.enquiryService.findAll(p, l, {
      entityType,
      entityId,
      status,
    });
  }

  @Get('my-enquiries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user enquiries' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'entity_type', required: false, enum: EntityType })
  async findMyEnquiries(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('entity_type') entityType?: EntityType,
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);

    return this.enquiryService.findByUser(req.user.id, p, l, entityType);
  }

  @Get('by-entity/:entity_type/:entity_id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get enquiries for a specific entity',
    description: 'Retrieve all enquiries for a specific property or ad. Admin/agent access required.'
  })
  @ApiParam({ 
    name: 'entity_type', 
    enum: EntityType,
    description: 'Type of entity',
    example: 'property'
  })
  @ApiParam({ 
    name: 'entity_id', 
    description: 'Unique identifier of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    example: 1,
    description: 'Page number for pagination'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    example: 10,
    description: 'Number of results per page (max 50)'
  })
  async findByEntity(
    @Param('entity_type') entityType: EntityType,
    @Param('entity_id') entityId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, Math.min(parseInt(String(limit), 10) || 10, 50));
    return this.enquiryService.findByEntity(entityType, entityId, p, l);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enquiry by ID' })
  @ApiParam({ name: 'id', description: 'Enquiry ID' })
  async findOne(@Param('id') id: string) {
    return this.enquiryService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update enquiry status' })
  @ApiParam({ name: 'id', description: 'Enquiry ID' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.enquiryService.updateStatus(id, status);
  }
}
