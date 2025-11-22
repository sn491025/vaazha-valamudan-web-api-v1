import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PropertyLeadService } from './services/property-lead.service';
import { UpdateLeadStatusDto } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '../../auth';


@ApiTags('Property Leads')
@Controller('property/leads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'agent')
@ApiBearerAuth()
export class PropertyLeadController {
  constructor(private readonly leadService: PropertyLeadService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'status', required: false, example: 'new' })
  @ApiQuery({ name: 'assignedToId', required: false })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status?: string,
    @Query('assignedToId') assignedToId?: string
  ) {
    const p = Math.max(1, parseInt(String(page), 10) || 1);
    const l = Math.max(1, parseInt(String(limit), 10) || 10);
    return this.leadService.findAll(p, l, status, assignedToId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lead statistics' })
  async getStats(@Request() req: any) {
    return this.leadService.getLeadStats(req.user.id);
  }

  @Put(':enquiryId/status')
  @ApiOperation({ summary: 'Update lead status' })
  @ApiParam({ name: 'enquiryId', description: 'Enquiry ID' })
  async updateStatus(
    @Param('enquiryId') enquiryId: string,
    @Body() updateLeadStatusDto: UpdateLeadStatusDto,
    @Request() req: any,
  ) {
    return this.leadService.updateLeadStatus(
      enquiryId,
      updateLeadStatusDto,
      req.user.id,
    );
  }

  @Get(':enquiryId/history')
  @ApiOperation({ summary: 'Get lead history' })
  @ApiParam({ name: 'enquiryId', description: 'Enquiry ID' })
  async getHistory(@Param('enquiryId') enquiryId: string, @Request() req: any) {
    return this.leadService.getLeadHistory(enquiryId);
  }
}
