import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserSubscriptionService } from './services/user-subscription.service';
import { SubscriptionFeatureService } from '../subscription-feature/services/subscription-feature.service';
import { PurchaseAddonDto, RecordFeatureUsageDto, SubscribeUserDto, UpdateUserSubscriptionDto } from './dto/user-subscription.dto';

@ApiTags('user-subscriptions')
@Controller()
export class UserSubscriptionController {
  constructor(
    private readonly userSubService: UserSubscriptionService,
    private readonly featureService: SubscriptionFeatureService,
  ) {}

  @Get('users/:userId/subscription')
  @ApiOperation({ summary: "Get user's active subscription" })
  @ApiParam({ name: 'userId', example: 101 })
  async active(@Param('userId') userId: string) {
    return this.userSubService.getActive(Number(userId));
  }

  @Post('users/:userId/subscribe')
  @ApiOperation({ summary: 'Subscribe user to plan' })
  @ApiParam({ name: 'userId', example: 101 })
  @ApiBody({
    type: SubscribeUserDto,
    examples: {
      sample: {
        summary: 'Subscribe to plan',
        value: {
          plan_id: 2,
          startDate: '2025-10-01T00:00:00.000Z',
          endDate: '2025-10-31T00:00:00.000Z',
          autoRenew: true,
          paidAmount: 1999.0,
          paymentStatus: 'Paid',
          transactionId: 'pay_abc123',
          promoCodeUsed: 'NEW10',
        },
      },
    },
  })
  async subscribe(@Param('userId') userId: string, @Body() dto: SubscribeUserDto) {
    return this.userSubService.subscribe(Number(userId), dto);
  }

  @Put('users/:userId/subscription/:id')
  @ApiOperation({ summary: 'Update user subscription' })
  @ApiParam({ name: 'userId', example: 101 })
  @ApiParam({ name: 'id', example: 42 })
  async update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserSubscriptionDto,
  ) {
    return this.userSubService.update(Number(userId), Number(id), dto);
  }

  @Post('users/:userId/subscription/:id/cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'userId', example: 101 })
  @ApiParam({ name: 'id', example: 42 })
  @ApiBody({
    description: 'Optional cancellation reason',
    examples: {
      sample: { value: { reason: 'No longer needed' } },
    },
  })
  async cancel(@Param('userId') userId: string, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.userSubService.cancel(Number(userId), Number(id), body?.reason);
  }

  @Post('users/:userId/add-ons')
  @ApiOperation({ summary: 'Purchase add-on' })
  @ApiParam({ name: 'userId', example: 101 })
  @ApiBody({
    type: PurchaseAddonDto,
    examples: {
      sample: {
        summary: 'Purchase boost',
        value: {
          item_id: 10,
          userSubscription_id: 42,
          startDate: '2025-10-05T00:00:00.000Z',
          endDate: '2025-10-12T00:00:00.000Z',
          paidAmount: 499.0,
          paymentStatus: 'Paid',
          transactionId: 'pay_xyz789',
          appliedTo: 'property_123',
        },
      },
    },
  })
  async purchaseAddon(@Param('userId') userId: string, @Body() dto: PurchaseAddonDto) {
    return this.userSubService.purchaseAddon(Number(userId), dto);
  }

  @Get('users/:userId/add-ons')
  @ApiOperation({ summary: "Get user's add-ons" })
  @ApiParam({ name: 'userId', example: 101 })
  async addons(@Param('userId') userId: string) {
    return this.userSubService.listAddons(Number(userId));
  }

  @Get('users/:userId/features/:featureName/access')
  @ApiOperation({ summary: 'Check feature access' })
  @ApiParam({ name: 'userId', example: 101 })
  @ApiParam({ name: 'featureName', example: 'Video Upload' })
  async access(@Param('userId') userId: string, @Param('featureName') featureName: string) {
    const hasAccess = await this.featureService.userHasFeatureAccess(Number(userId), featureName);
    return { success: true, data: { hasAccess } };
  }

  @Get('users/:userId/features/usage')
  @ApiOperation({ summary: 'Get feature usage' })
  @ApiParam({ name: 'userId', example: 101 })
  async usage(@Param('userId') userId: string) {
    const data = await this.featureService.getUsage(Number(userId));
    return { success: true, data };
  }

  @Post('users/:userId/features/:featureName/usage')
  @ApiOperation({ summary: 'Record feature usage' })
  @ApiParam({ name: 'userId', example: 101 })
  @ApiParam({ name: 'featureName', example: 'Property Listings' })
  @ApiBody({
    type: RecordFeatureUsageDto,
    examples: { sample: { value: { usageCount: 1, usageValue: 0 } } },
  })
  async recordUsage(
    @Param('userId') userId: string,
    @Param('featureName') featureName: string,
    @Body() body: RecordFeatureUsageDto,
  ) {
    const ok = await this.featureService.recordFeatureUsage(Number(userId), featureName, body?.usageCount ?? 1, body?.usageValue ?? 0);
    return { success: ok };
  }
}
