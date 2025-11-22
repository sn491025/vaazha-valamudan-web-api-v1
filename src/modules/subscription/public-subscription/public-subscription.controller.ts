import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubscriptionPlanService } from '../subscription-plan/services/subscription-plan.service';

@ApiTags('public-subscriptions')
@Controller('public')
export class PublicSubscriptionController {
  constructor(private readonly planService: SubscriptionPlanService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get public plan list' })
  @ApiQuery({ name: 'includeItems', required: false, example: 'true' })
  async plans(@Query('includeItems') includeItems?: string) {
    return this.planService.findAll(includeItems ?? 'true', 'true');
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan details' })
  @ApiParam({ name: 'id', example: 1 })
  async plan(@Param('id') id: string) {
    return this.planService.findOne(Number(id), 'true');
  }
}
