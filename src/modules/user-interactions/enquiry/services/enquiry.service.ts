import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry } from '../../entities/enquiry.entity';
import { CreateEnquiryDto } from '../dto';
import { EntityType } from '../../saved-search/dto';

@Injectable()
export class EnquiryService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
  ) {}

  async create(dto: CreateEnquiryDto, userId?: string) {
    const enquiry = this.enquiryRepository.create({
      ...dto,
      user_id: userId,
      status: 'new',
    });

    const saved = await this.enquiryRepository.save(enquiry);
    // TODO: Update entity contact count - implement in specific entity services

    return saved;
  }

  async findAll(page = 1, limit = 10, filters?: {
    entityType?: EntityType;
    entityId?: string;
    userId?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters?.entityType) where.entity_type = filters.entityType;
    if (filters?.entityId) where.entity_id = filters.entityId;
    if (filters?.userId) where.user_id = filters.userId;
    if (filters?.status) where.status = filters.status;

    const [data, total] = await this.enquiryRepository.findAndCount({
      where,
      relations: { user: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const enquiry = await this.enquiryRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    return enquiry;
  }

  async updateStatus(id: string, status: string) {
    await this.enquiryRepository.update(id, { status });
    return this.findOne(id);
  }

  async findByEntity(entityType: EntityType, entityId: string, page = 1, limit = 10) {
    return this.findAll(page, limit, { entityType, entityId });
  }

  async findByUser(userId: string, page = 1, limit = 10, entityType?: EntityType) {
    return this.findAll(page, limit, { userId, entityType });
  }
}
