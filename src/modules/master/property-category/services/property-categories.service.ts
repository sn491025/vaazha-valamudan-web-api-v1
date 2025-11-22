import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyCategory } from '../../entities/property-category.entity';
import { CreatePropertyCategoryDto } from '../dto/create-property-category.dto';
import { UpdatePropertyCategoryDto } from '../dto/update-property-category.dto';
import { PropertyCategoryResponseDto } from '../dto/property-category-response.dto';

@Injectable()
export class PropertyCategoriesService {
  constructor(
    @InjectRepository(PropertyCategory)
    private readonly repo: Repository<PropertyCategory>,
  ) {}

  async findAll(activeOnly = true): Promise<PropertyCategoryResponseDto[]> {
    const items = await this.repo.find({
      where: activeOnly ? { is_active: true } : {},
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return items.map((pc) => this.toResponse(pc));
  }

  async findOne(id: string): Promise<PropertyCategoryResponseDto> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Property category not found');
    return this.toResponse(item);
  }

  async create(dto: CreatePropertyCategoryDto): Promise<PropertyCategoryResponseDto> {
    const entity = this.repo.create({
      name: dto.name,
      description: dto.description,
      icon: dto.icon,
      sort_order: dto.sortOrder ?? 0,
      is_active: dto.isActive ?? true,
    });
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdatePropertyCategoryDto): Promise<PropertyCategoryResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Property category not found');
    entity.name = dto.name ?? entity.name;
    entity.description = dto.description ?? entity.description;
    entity.icon = dto.icon ?? entity.icon;
    entity.sort_order = dto.sortOrder ?? entity.sort_order;
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async updateStatus(id: string, isActive: boolean): Promise<PropertyCategoryResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Property category not found');
    entity.is_active = isActive;
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  private toResponse(pc: PropertyCategory): PropertyCategoryResponseDto {
    return {
      id: pc.id,
      name: pc.name,
      description: pc.description ?? undefined,
      icon: pc.icon ?? undefined,
      isActive: pc.is_active,
      sortOrder: pc.sort_order,
      createdAt: pc.created_at,
      updatedAt: pc.updated_at,
    };
  }
}
