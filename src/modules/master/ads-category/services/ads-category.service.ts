import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdCategory } from '../../entities/ad-category.entity';
import { Repository } from 'typeorm';
import { AdsCategoryResponseDto } from '../dto/ads-category-response.dto';
import { CreateAdsCategoryDto } from '../dto/create-ads-category.dto';
import { UpdateAdsCategoryDto } from '../dto/update-ads-category.dto';

@Injectable()
export class AdsCategoryService {

  constructor(
    @InjectRepository(AdCategory)
    private readonly repo: Repository<AdCategory>
  ) {}

  async findAll(activeOnly = true): Promise<AdsCategoryResponseDto[]> {
    const items = await this.repo.find({
      where: activeOnly ? { is_active: true } : {},
      order: { sort_order: 'ASC', name: 'ASC' },
    });
    return items.map((pc) => this.toResponse(pc));
  }

  async findOne(id: string): Promise<AdsCategoryResponseDto> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Ads category not found');
    return this.toResponse(item);
  }

  async create(dto: CreateAdsCategoryDto): Promise<AdsCategoryResponseDto> {
    const entity = this.repo.create({
      name: dto.name,
      description: dto.description,
      sort_order: dto.sortOrder ?? 0,
      is_active: dto.isActive ?? true,
    });
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async update(id: string, dto: UpdateAdsCategoryDto): Promise<AdsCategoryResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Ads category not found');
    entity.name = dto.name ?? entity.name;
    entity.description = dto.description ?? entity.description;
    entity.sort_order = dto.sortOrder ?? entity.sort_order;
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  async updateStatus(id: string, isActive: boolean): Promise<AdsCategoryResponseDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Ads category not found');
    entity.is_active = isActive;
    const saved = await this.repo.save(entity);
    return this.toResponse(saved);
  }

  private toResponse(pc: AdCategory): AdsCategoryResponseDto {
    return {
      id: pc.id,
      name: pc.name,
      description: pc.description ?? undefined,
      isActive: pc.is_active,
      sortOrder: pc.sort_order,
      createdAt: pc.created_at,
      updatedAt: pc.updated_at,
    };
  }

}
