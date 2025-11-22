import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyReport } from '../../entities/property-report.entity';
import { Property } from '../../entities/properties.entity';
import { CreatePropertyReportDto } from '../dto/create-report.dto';

@Injectable()
export class PropertyReportService {
  constructor(
    @InjectRepository(PropertyReport) private readonly reportRepo: Repository<PropertyReport>,
    @InjectRepository(Property) private readonly propertyRepo: Repository<Property>,
  ) {}

  async create(propertyId: string, dto: CreatePropertyReportDto, reporterId?: string) {
    const property = await this.propertyRepo.findOne({ where: { id: propertyId } });
    if (!property) throw new NotFoundException('Property not found');

    const created = this.reportRepo.create({
      property_id: propertyId,
      report_type: dto.report_type,
      description: dto.description,
      status: 'PENDING',
      evidence: dto.evidence,
      is_anonymous: !!dto.is_anonymous,
      severity: dto.severity ?? 1,
      reporter_id: dto.reporter_id ?? reporterId,
    });
    return this.reportRepo.save(created);
  }

  async list(page = 1, limit = 10, status?: string) {
    const [data, total] = await this.reportRepo.findAndCount({
      where: status ? { status } : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { property: true },
    });
    return { data, total, page, limit };
  }

  async get(id: string) {
    const row = await this.reportRepo.findOne({ where: { id }, relations: { property: true } });
    if (!row) throw new NotFoundException('Report not found');
    return row;
  }

  async resolve(id: string, reviewerId: string | undefined, resolution_notes?: string, resolution_action?: string) {
    await this.ensureExists(id);
    await this.reportRepo.update(id, {
      status: 'RESOLVED',
      reviewer_id: reviewerId,
      resolution_notes,
      resolution_action,
      resolved_at: new Date(),
    });
    return this.get(id);
  }

  async dismiss(id: string, reviewerId: string | undefined, resolution_notes?: string) {
    await this.ensureExists(id);
    await this.reportRepo.update(id, {
      status: 'DISMISSED',
      reviewer_id: reviewerId,
      resolution_notes,
      resolved_at: new Date(),
    });
    return this.get(id);
  }

  async stats() {
    const statuses = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
    const items = await Promise.all(
      statuses.map(async (s) => ({
        status: s,
        count: await this.reportRepo.count({ where: { status: s } }),
      })),
    );
    const byType = await this.reportRepo
      .createQueryBuilder('r')
      .select('r.report_type', 'report_type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.report_type')
      .getRawMany();
    return { by_status: items, by_type: byType };
  }

  private async ensureExists(id: string) {
    const exists = await this.reportRepo.exist({ where: { id } });
    if (!exists) throw new NotFoundException('Report not found');
  }
}
