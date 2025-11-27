import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { UserSubscription } from '../../entities/user-subscription.entity';
import { SubscriptionPlanItem } from '../../entities/subscription-plan-item.entity';
import { SubscriptionItem } from '../../entities/subscription-item.entity';
import { UserSubscriptionUsage } from '../../entities/user-subscription-usage.entity';
import { UserPurchasedItem } from '../../entities/user-purchased-item.entity';
import { SubscribeUserDto, UpdateUserSubscriptionDto, PurchaseAddonDto } from '../dto/user-subscription.dto';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { RazorpayService } from '../../../shared/services/payment/razorpay.service';

@Injectable()
export class UserSubscriptionService {
  constructor(
    @InjectRepository(UserSubscription) private readonly subRepo: Repository<UserSubscription>,
    @InjectRepository(SubscriptionPlanItem) private readonly planItemRepo: Repository<SubscriptionPlanItem>,
    @InjectRepository(SubscriptionItem) private readonly itemRepo: Repository<SubscriptionItem>,
    @InjectRepository(UserSubscriptionUsage) private readonly usageRepo: Repository<UserSubscriptionUsage>,
    @InjectRepository(UserPurchasedItem) private readonly purchasedRepo: Repository<UserPurchasedItem>,
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
    private readonly razorpayService: RazorpayService,
  ) { }

  async getActive(userId: string) {
    const now = new Date();
    const sub = await this.subRepo.findOne({
      where: { user_id: userId, isActive: true, endDate: MoreThanOrEqual(now) },
      relations: { plan: true, purchasedItems: true },
    });
    return { success: true, data: sub || null };
  }

  async subscribe(userId: string, dto: SubscribeUserDto) {
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

  async update(userId: string, id: number, dto: UpdateUserSubscriptionDto) {
    const row = await this.subRepo.findOne({ where: { id, user_id: userId } });
    if (!row) throw new NotFoundException('User subscription not found');
    await this.subRepo.update(id, {
      autoRenew: dto.autoRenew ?? row.autoRenew,
      status: dto.status ?? row.status,
      endDate: dto.endDate ? new Date(dto.endDate) : row.endDate,
    } as any);
    return this.getActive(userId);
  }

  async createSubscriptionOrder(userId: string, planId: number) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const shortUser = String(userId).slice(0, 6);
    const receipt = `sub_${shortUser}_${Date.now()}`;

    const order = await this.razorpayService.createOrder(
      plan.price,
      'INR',
      receipt,
      { type: 'SUBSCRIPTION', plan_id: planId, user_id: userId }
    );
    return order;
  }

  async verifySubscription(userId: string, dto: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    // 1. Verify Payment
    const isValid = this.razorpayService.verifySignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
    if (!isValid) throw new UnauthorizedException('Invalid payment signature');

    // 2. Fetch Order to get Plan ID from notes
    const order = await this.razorpayService.getOrderById(dto.razorpay_order_id);
    const planId = order.notes?.plan_id;
    if (!planId) throw new BadRequestException('Invalid order: missing plan details');

    // 3. Fetch Plan
    const plan = await this.planRepo.findOne({ where: { id: Number(planId) } });
    if (!plan) throw new NotFoundException('Plan not found');

    // 4. Calculate Dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + plan.durationDays);

    // 5. Create Subscription
    const entity = this.subRepo.create({
      user_id: userId,
      plan_id: plan.id,
      startDate: startDate,
      endDate: endDate,
      autoRenew: false, // Default to false for manual flow
      paidAmount: plan.price,
      paymentStatus: 'paid',
      transactionId: dto.razorpay_payment_id,
      isActive: true,
      status: 'active',
    } as any);
    const saved = await this.subRepo.save(entity as any);
    return { success: true, data: saved };
  }

  async createAddonOrder(userId: string, itemId: number) {
    const item = await this.itemRepo.findOne({ where: { id: itemId } });
    if (!item || !item.isAddon) throw new BadRequestException('Add-on not available');

    const order = await this.razorpayService.createOrder(
      item.basePrice,
      'INR',
      `receipt_addon_${userId}_${Date.now()}`,
      { type: 'ADDON', item_id: itemId, user_id: userId }
    );
    return order;
  }

  async verifyAddon(userId: string, dto: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
    // 1. Verify Payment
    const isValid = this.razorpayService.verifySignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature,
    );
    if (!isValid) throw new UnauthorizedException('Invalid payment signature');

    // 2. Fetch Order to get Item ID from notes
    const order = await this.razorpayService.getOrderById(dto.razorpay_order_id);
    const itemId = order.notes?.item_id;
    if (!itemId) throw new BadRequestException('Invalid order: missing item details');

    // 3. Fetch Item
    const item = await this.itemRepo.findOne({ where: { id: Number(itemId) } });
    if (!item) throw new NotFoundException('Add-on not found');

    // 4. Find Active Subscription
    const sub = await this.getActive(userId);
    if (!sub.data) throw new BadRequestException('No active subscription found');

    // 5. Create Purchased Item
    const entity = this.purchasedRepo.create({
      user_subscription_id: sub.data.id,
      item_id: item.id,
      plan_item_id: null,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default 30 days for now
      isActive: true,
      paidAmount: item.basePrice,
      status: 'active',
      paymentStatus: 'paid',
      transactionId: dto.razorpay_payment_id,
      appliedTo: null,
    } as any);
    const saved = await this.purchasedRepo.save(entity as any);
    return { success: true, data: saved };
  }

  async cancel(userId: string, id: number, reason?: string) {
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

  async listAddons(userId: string) {
    const items = await this.purchasedRepo.find({
      where: { user_subscription_id: (await this.getActive(userId)).data?.id || -1 },
      relations: { item: true },
    });
    return { success: true, data: items };
  }

  async purchaseAddon(userId: string, dto: PurchaseAddonDto) {
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
