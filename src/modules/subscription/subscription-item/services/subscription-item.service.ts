import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { SubscriptionItem } from '../../entities/subscription-item.entity';
import { CreateSubscriptionItemDto, UpdateSubscriptionItemDto } from '../dto/subscription-item.dto';

@Injectable()
export class SubscriptionItemService {
  constructor(
    @InjectRepository(SubscriptionItem) private readonly repo: Repository<SubscriptionItem>,
  ) {}

  async findAll(filters?: { type?: string; category?: string; isActive?: string; isAddon?: string }) {
    const where: FindOptionsWhere<SubscriptionItem> = {};
    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = Like(`%${filters.category}%`);
    if (filters?.isActive != null) where.isActive = filters.isActive === 'true';
    if (filters?.isAddon != null) where.isAddon = filters.isAddon === 'true';
    const [data, count] = await this.repo.findAndCount({ where, order: { displayOrder: 'ASC', name: 'ASC' } });
    return { success: true, data, count };
  }

  async findOne(id: number) {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Subscription item not found');
    return { success: true, data: row };
  }

  async create(dto: CreateSubscriptionItemDto) {
    const entity = this.repo.create(dto as any);
    const saved = await this.repo.save(entity as any);
    return { success: true, data: saved };
  }

  async update(id: number, dto: UpdateSubscriptionItemDto) {
    await this.ensure(id);
    await this.repo.update(id, dto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.ensure(id);
    await this.repo.delete(id);
    return { success: true };
  }

  private async ensure(id: number) {
    const exists = await this.repo.exist({ where: { id } });
    if (!exists) throw new NotFoundException('Subscription item not found');
  }
}
