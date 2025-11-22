import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../../entities/subscription-plan.entity';
import { SubscriptionPlanItem } from '../../entities/subscription-plan-item.entity';
import { CreateSubscriptionPlanDto, PlanItemConfigDto, UpdateSubscriptionPlanDto } from '../dto/subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionPlanItem) private readonly planItemRepo: Repository<SubscriptionPlanItem>,
  ) {}

  async findAll(includeItems?: string, isActive?: string) {
    const where: any = {};
    if (isActive != null) where.isActive = isActive === 'true';
    const plans = await this.planRepo.find({
      where,
      order: { displayOrder: 'ASC', price: 'ASC' },
      relations: includeItems === 'true' ? { planItems: { item: true } } : {},
    });
    return { success: true, data: plans, count: plans.length };
  }

  async findOne(id: number, includeItems?: string) {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: includeItems === 'true' ? { planItems: { item: true } } : {},
    });
    if (!plan) throw new NotFoundException('Plan not found');
    return { success: true, data: plan };
  }

  async create(dto: CreateSubscriptionPlanDto) {
    const plan = this.planRepo.create({
      ...dto,
      planItems: undefined,
    } as any);
    const saved = await this.planRepo.save(plan as any);
    if (dto.planItems?.length) {
      await this.replacePlanItems(saved.id, dto.planItems);
    }
    return this.findOne(saved.id, 'true');
  }

  async update(id: number, dto: UpdateSubscriptionPlanDto) {
    await this.ensurePlan(id);
    await this.planRepo.update(id, {
      ...dto,
      planItems: undefined,
    } as any);
    if (dto.planItems) {
      await this.replacePlanItems(id, dto.planItems);
    }
    return this.findOne(id, 'true');
  }

  async remove(id: number) {
    await this.ensurePlan(id);
    await this.planRepo.delete(id);
    return { success: true };
  }

  async replacePlanItems(planId: number, items: PlanItemConfigDto[]) {
    await this.planItemRepo.delete({ plan_id: planId as any });
    const rows = items.map((i) =>
      this.planItemRepo.create({
        plan_id: planId,
        item_id: i.item_id,
        isIncluded: i.isIncluded ?? true,
        isConfigurable: !!i.isConfigurable,
        price: i.price ?? 0,
        numericValue: i.numericValue ?? 0,
        textValue: i.textValue,
        durationDays: i.durationDays ?? 0,
        isUnlimited: !!i.isUnlimited,
        isHighlighted: !!i.isHighlighted,
        customSettings: i.customSettings,
      } as any),
    );
    if (rows.length) await this.planItemRepo.save(rows as any);
    return this.findOne(planId, 'true');
  }

  async updatePlanItem(planId: number, itemId: number, patch: Partial<PlanItemConfigDto>) {
    const row = await this.planItemRepo.findOne({ where: { plan_id: planId, item_id: itemId } });
    if (!row) throw new NotFoundException('Plan item not found');
    await this.planItemRepo.update(row.id, patch as any);
    return this.findOne(planId, 'true');
  }

  async removePlanItem(planId: number, itemId: number) {
    await this.planItemRepo.delete({ plan_id: planId as any, item_id: itemId as any });
    return this.findOne(planId, 'true');
  }

  private async ensurePlan(id: number) {
    const exists = await this.planRepo.exist({ where: { id } });
    if (!exists) throw new NotFoundException('Plan not found');
  }
}
