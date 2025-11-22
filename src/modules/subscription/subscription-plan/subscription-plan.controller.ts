import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { CreateSubscriptionPlanDto, PlanItemConfigDto, UpdateSubscriptionPlanDto } from './dto/subscription-plan.dto';

@ApiTags('subscription-plans')
@Controller('subscription-plans')
export class SubscriptionPlanController {
  constructor(private readonly service: SubscriptionPlanService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription plans' })
  @ApiQuery({ name: 'includeItems', required: false, example: 'true' })
  @ApiQuery({ name: 'isActive', required: false, example: 'true' })
  async list(@Query('includeItems') includeItems?: string, @Query('isActive') isActive?: string) {
    return this.service.findAll(includeItems, isActive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription plan' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiQuery({ name: 'includeItems', required: false, example: 'true' })
  async get(@Param('id') id: string, @Query('includeItems') includeItems?: string) {
    return this.service.findOne(Number(id), includeItems);
  }

  @Post()
  @ApiOperation({ summary: 'Create subscription plan' })
  @ApiBody({
    type: CreateSubscriptionPlanDto,
    examples: {
      sample: {
        summary: 'Create Gold plan',
        value: {
          name: 'Gold Plan',
          tagline: 'Best for professionals',
          price: 1999.0,
          durationDays: 30,
          description: 'Professional plan with premium features',
          isPopular: true,
          isActive: true,
          planItems: [
            { item_id: 1, isIncluded: true, numericValue: 30, isUnlimited: false },
            { item_id: 2, isIncluded: true, durationDays: 45 },
          ],
        },
      },
    },
  })
  async create(@Body() dto: CreateSubscriptionPlanDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update subscription plan' })
  @ApiParam({ name: 'id', example: 1 })
  async update(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription plan' })
  @ApiParam({ name: 'id', example: 1 })
  async remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  @Post(':planId/items')
  @ApiOperation({ summary: 'Add/replace items for plan' })
  @ApiParam({ name: 'planId', example: 1 })
  @ApiBody({
    description: 'Array of plan item configs (replaces existing)',
    type: [PlanItemConfigDto],
  })
  async replaceItems(@Param('planId') planId: string, @Body() items: PlanItemConfigDto[]) {
    return this.service.replacePlanItems(Number(planId), items || []);
  }

  @Put(':planId/items/:itemId')
  @ApiOperation({ summary: 'Update plan item config' })
  @ApiParam({ name: 'planId', example: 1 })
  @ApiParam({ name: 'itemId', example: 2 })
  async updatePlanItem(
    @Param('planId') planId: string,
    @Param('itemId') itemId: string,
    @Body() patch: Partial<PlanItemConfigDto>,
  ) {
    return this.service.updatePlanItem(Number(planId), Number(itemId), patch || {});
  }

  @Delete(':planId/items/:itemId')
  @ApiOperation({ summary: 'Delete item from plan' })
  @ApiParam({ name: 'planId', example: 1 })
  @ApiParam({ name: 'itemId', example: 2 })
  async removePlanItem(@Param('planId') planId: string, @Param('itemId') itemId: string) {
    return this.service.removePlanItem(Number(planId), Number(itemId));
  }
}
