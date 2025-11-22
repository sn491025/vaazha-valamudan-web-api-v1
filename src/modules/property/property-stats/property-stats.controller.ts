import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PropertyStatsService } from './services/property-stats.service';
import { Roles, RolesGuard } from '../../auth';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';


@ApiTags('Property Statistics')
@Controller('property/stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PropertyStatsController {
  constructor(private readonly statsService: PropertyStatsService) {}

  @Get('agent/:id')
  @ApiOperation({ summary: 'Get agent statistics' })
  @ApiParam({ name: 'id', description: 'Agent ID' })
  async getAgentStats(@Param('id') id: string) {
    return this.statsService.getAgentStats(id);
  }

  @Get('property/:id')
  @ApiOperation({ summary: 'Get property statistics' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  async getPropertyStats(@Param('id') id: string) {
    return this.statsService.getPropertyStats(id);
  }

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('admin', 'agent')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Request() req: any) {
    return this.statsService.getDashboardStats(req.user);
  }
}
