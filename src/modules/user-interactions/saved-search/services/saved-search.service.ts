import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from '../../entities/saved-search.entity';
import { CreateSavedSearchDto, UpdateSavedSearchDto, EntityType } from '../dto';

@Injectable()
export class SavedSearchService {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly savedSearchRepository: Repository<SavedSearch>,
  ) {}

  async create(dto: CreateSavedSearchDto, userId: string) {
    const savedSearch = this.savedSearchRepository.create({
      ...dto,
      user_id: userId,
    });

    return this.savedSearchRepository.save(savedSearch);
  }

  async findAllByUser(userId: string, entityType?: EntityType) {
    const where: any = { user_id: userId };
    if (entityType) {
      where.entity_type = entityType;
    }

    return this.savedSearchRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }

    return savedSearch;
  }

  async update(id: string, dto: UpdateSavedSearchDto, userId: string) {
    const savedSearch = await this.findOne(id, userId);

    Object.assign(savedSearch, dto);
    return this.savedSearchRepository.save(savedSearch);
  }

  async remove(id: string, userId: string) {
    const savedSearch = await this.findOne(id, userId);
    await this.savedSearchRepository.remove(savedSearch);
    return { success: true };
  }
}
