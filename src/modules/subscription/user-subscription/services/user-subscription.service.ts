import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UserSubscription } from '../../entities/user-subscription.entity';
import { SubscriptionPlanItem } from '../../entities/subscription-plan-item.entity';
import { SubscriptionItem } from '../../entities/subscription-item.entity';
import { UserSubscriptionUsage } from '../../entities/user-subscription-usage.entity';
import { UserPurchasedItem } from '../../entities/user-purchased-item.entity';
import { SubscribeUserDto, UpdateUserSubscriptionDto, PurchaseAddonDto } from '../dto/user-subscription.dto';

@Injectable()
export class UserSubscriptionService {
  constructor(
    @InjectRepository(UserSubscription) private readonly subRepo: Repository<UserSubscription>,
    @InjectRepository(SubscriptionPlanItem) private readonly planItemRepo: Repository<SubscriptionPlanItem>,
    @InjectRepository(SubscriptionItem) private readonly itemRepo: Repository<SubscriptionItem>,
    @InjectRepository(UserSubscriptionUsage) private readonly usageRepo: Repository<UserSubscriptionUsage>,
    @InjectRepository(UserPurchasedItem) private readonly purchasedRepo: Repository<UserPurchasedItem>,
  ) {}

  async getActive(userId: number) {
    const now = new Date();
    const sub = await this.subRepo.findOne({
      where: { user_id: userId, isActive: true, endDate: MoreThanOrEqual(now) },
      relations: { plan: true, purchasedItems: true },
    });
    return { success: true, data: sub || null };
  }

  async subscribe(userId: number, dto: SubscribeUserDto) {
    const entity = this.subRepo.create({
      user_id: userId,
      plan_id: dto.plan_id,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      autoRenew: !!dto.autoRenew,
      paidAmount: dto.paidAmount,
      paymentStatus: dto.paymentStatus,
      transactionId: dto.transactionId,
      promoCodeUsed: dto.promoCodeUsed,
      isActive: true,
      status: 'active',
    } as any);
    const saved = await this.subRepo.save(entity as any);
    return { success: true, data: saved };
  }

  async update(userId: number, id: number, dto: UpdateUserSubscriptionDto) {
    const row = await this.subRepo.findOne({ where: { id, user_id: userId } });
    if (!row) throw new NotFoundException('User subscription not found');
    await this.subRepo.update(id, {
      autoRenew: dto.autoRenew ?? row.autoRenew,
      status: dto.status ?? row.status,
      endDate: dto.endDate ? new Date(dto.endDate) : row.endDate,
    } as any);
    return this.getActive(userId);
  }

  async cancel(userId: number, id: number, reason?: string) {
    const row = await this.subRepo.findOne({ where: { id, user_id: userId } });
    if (!row) throw new NotFoundException('User subscription not found');
    await this.subRepo.update(id, {
      isActive: false,
      status: 'canceled',
      canceledAt: new Date(),
      cancellationReason: reason,
    } as any);
    return { success: true };
  }

  async listAddons(userId: number) {
    const items = await this.purchasedRepo.find({
      where: { user_subscription_id: (await this.getActive(userId)).data?.id || -1 },
      relations: { item: true },
    });
    return { success: true, data: items };
  }

  async purchaseAddon(userId: number, dto: PurchaseAddonDto) {
    const sub = await this.subRepo.findOne({ where: { id: dto.userSubscription_id, user_id: userId, isActive: true } });
    if (!sub) throw new BadRequestException('Active subscription not found');

    const item = await this.itemRepo.findOne({ where: { id: dto.item_id, isActive: true } });
    if (!item || !item.isAddon) throw new BadRequestException('Add-on not available');

    const entity = this.purchasedRepo.create({
      user_subscription_id: sub.id,
      item_id: item.id,
      plan_item_id: null,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      isActive: true,
      paidAmount: dto.paidAmount,
      status: 'active',
      paymentStatus: dto.paymentStatus,
      transactionId: dto.transactionId,
      appliedTo: dto.appliedTo,
    } as any);
    const saved = await this.purchasedRepo.save(entity as any);
    return { success: true, data: saved };
  }
}
