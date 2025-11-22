import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureGroup } from '../../entities/feature-group.entity';
import { CreateFeatureGroupDto } from '../dto/create-feature-group.dto';
import { UpdateFeatureGroupDto } from '../dto/update-feature-group.dto';
import { FeatureGroupResponseDto } from '../dto/feature-group-response.dto';

@Injectable()
export class FeatureGroupsService {
  constructor(
    @InjectRepository(FeatureGroup)
    private readonly repo: Repository<FeatureGroup>,
  ) {}

  async findAll(activeOnly = true): Promise<FeatureGroupResponseDto[]> {
    const items = await this.repo.find({
      where: activeOnly ? { is_active: true } : {},
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return items.map((g) => this.toResponse(g));
  }

  async findOne(id: string): Promise<FeatureGroupResponseDto> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Feature group not found');
    return this.toResponse(item);
  }

  async create(dto: CreateFeatureGroupDto): Promise<FeatureGroupResponseDto> {
    const entity = this.repo.create({
      name: dto.name,
      icon: dto.icon,
      sort_order: dto.sortOrder ?? 0,
      is_active: dto.isActive ?? true,
    });
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdateFeatureGroupDto): Promise<FeatureGroupResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Feature group not found');
    entity.name = dto.name ?? entity.name;
    entity.icon = dto.icon ?? entity.icon;
    entity.sort_order = dto.sortOrder ?? entity.sort_order;
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async updateStatus(id: string, isActive: boolean): Promise<FeatureGroupResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Feature group not found');
    entity.is_active = isActive;
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  private toResponse(g: FeatureGroup): FeatureGroupResponseDto {
    return {
      id: g.id,
      name: g.name,
      icon: g.icon ?? undefined,
      sortOrder: g.sort_order,
      isActive: g.is_active,
      createdAt: g.created_at,
      updatedAt: g.updated_at,
    };
  }
}
