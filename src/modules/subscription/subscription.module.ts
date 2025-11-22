import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionItem } from './entities/subscription-item.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlanItem } from './entities/subscription-plan-item.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { UserSubscriptionUsage } from './entities/user-subscription-usage.entity';
import { UserPurchasedItem } from './entities/user-purchased-item.entity';

import { SubscriptionItemController } from './subscription-item/subscription-item.controller';
import { SubscriptionPlanController } from './subscription-plan/subscription-plan.controller';
import { UserSubscriptionController } from './user-subscription/user-subscription.controller';
import { PublicSubscriptionController } from './public-subscription/public-subscription.controller';

import { SubscriptionItemService } from './subscription-item/services/subscription-item.service';
import { SubscriptionPlanService } from './subscription-plan/services/subscription-plan.service';
import { UserSubscriptionService } from './user-subscription/services/user-subscription.service';
import { SubscriptionFeatureService } from './subscription-feature/services/subscription-feature.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionItem,
      SubscriptionPlan,
      SubscriptionPlanItem,
      UserSubscription,
      UserSubscriptionUsage,
      UserPurchasedItem,
    ]),
  ],
  controllers: [
    SubscriptionItemController,
    SubscriptionPlanController,
    UserSubscriptionController,
    PublicSubscriptionController,
  ],
  providers: [
    SubscriptionItemService,
    SubscriptionPlanService,
    UserSubscriptionService,
    SubscriptionFeatureService,
  ],
  exports: [SubscriptionFeatureService, UserSubscriptionService],
})
export class SubscriptionModule {}