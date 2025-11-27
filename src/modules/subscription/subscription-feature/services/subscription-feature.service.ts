import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UserSubscription } from '../../entities/user-subscription.entity';
import { SubscriptionPlanItem } from '../../entities/subscription-plan-item.entity';
import { SubscriptionItem } from '../../entities/subscription-item.entity';
import { UserSubscriptionUsage } from '../../entities/user-subscription-usage.entity';
import { UserPurchasedItem } from '../../entities/user-purchased-item.entity';

@Injectable()
export class SubscriptionFeatureService {
  constructor(
    @InjectRepository(UserSubscription) private readonly subRepo: Repository<UserSubscription>,
    @InjectRepository(SubscriptionPlanItem) private readonly planItemRepo: Repository<SubscriptionPlanItem>,
    @InjectRepository(SubscriptionItem) private readonly itemRepo: Repository<SubscriptionItem>,
    @InjectRepository(UserSubscriptionUsage) private readonly usageRepo: Repository<UserSubscriptionUsage>,
    @InjectRepository(UserPurchasedItem) private readonly purchasedRepo: Repository<UserPurchasedItem>,
  ) {}

  async userHasFeatureAccess(userId: string, featureName: string) {
    const now = new Date();
    const sub = await this.subRepo.findOne({
      where: { user_id: userId, isActive: true, endDate: MoreThanOrEqual(now) },
    });
    if (!sub) return false;

    const feature = await this.itemRepo.findOne({ where: { name: featureName, isActive: true } });
    if (!feature) return false;

    const planItem = await this.planItemRepo.findOne({
      where: { plan_id: sub.plan_id, item_id: feature.id, isIncluded: true },
    });
    if (planItem) {
      if (feature.valueType === 'NUMERIC' && !planItem.isUnlimited && planItem.numericValue > 0) {
        const usage = await this.usageRepo.findOne({
          where: { user_subscription_id: sub.id, item_id: feature.id },
        });
        if (usage && usage.usedCount >= planItem.numericValue) return false;
      }
      return true;
    }

    if (feature.isAddon) {
      const purchased = await this.purchasedRepo.findOne({
        where: {
          user_subscription_id: sub.id,
          item_id: feature.id,
          isActive: true,
          endDate: MoreThanOrEqual(now),
        },
      });
      return !!purchased;
    }

    return false;
  }

  async recordFeatureUsage(
    userId: string,
    featureName: string,
    usageCount = 1,
    usageValue = 0,
  ) {
    const now = new Date();
    const sub = await this.subRepo.findOne({
      where: { user_id: userId, isActive: true, endDate: MoreThanOrEqual(now) },
    });
    if (!sub) return false;

    const feature = await this.itemRepo.findOne({ where: { name: featureName, isActive: true } });
    if (!feature) return false;

    let usage = await this.usageRepo.findOne({
      where: { user_subscription_id: sub.id, item_id: feature.id },
    });
    if (!usage) {
      usage = this.usageRepo.create({
        user_subscription_id: sub.id,
        item_id: feature.id,
        usedCount: usageCount,
        usedValue: usageValue,
        lastUsedAt: new Date(),
      });
      await this.usageRepo.save(usage as any);
    } else {
      await this.usageRepo.update(usage.id, {
        usedCount: (usage.usedCount || 0) + usageCount,
        usedValue: (usage.usedValue as any || 0) + usageValue,
        lastUsedAt: new Date(),
      } as any);
    }
    return true;
  }

  async getUsage(userId: string) {
    const now = new Date();
    const sub = await this.subRepo.findOne({
      where: { user_id: userId, isActive: true, endDate: MoreThanOrEqual(now) },
    });
    if (!sub) return [];
    return this.usageRepo.find({ where: { user_subscription_id: sub.id } });
  }
}
