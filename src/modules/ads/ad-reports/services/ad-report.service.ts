import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdReport } from '../../entities/ad-report.entity';
import { Ad } from '../../entities/ad.entity';
import { CreateAdReportDto } from '../dto/create-report.dto';

@Injectable()
export class AdReportService {
  constructor(
    @InjectRepository(AdReport) private readonly reportRepo: Repository<AdReport>,
    @InjectRepository(Ad) private readonly adRepo: Repository<Ad>,
  ) {}

  async create(adId: string, dto: CreateAdReportDto, reporterId?: string) {
    const ad = await this.adRepo.findOne({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    // Prevent users from reporting their own ads
    if (reporterId && ad.owner_id === reporterId) {
      throw new BadRequestException('You cannot report your own ad');
    }

    const created = this.reportRepo.create({
      ad_id: adId,
      report_type: dto.report_type,
      description: dto.description,
      status: 'PENDING',
      evidence: dto.evidence,
      is_anonymous: !!dto.is_anonymous,
      severity: dto.severity ?? 1,
      reporter_id: dto.reporter_id ?? reporterId,
    } as any);
    return this.reportRepo.save(created);
  }

  async list(page = 1, limit = 10, status?: string) {
    const [data, total] = await this.reportRepo.findAndCount({
      where: status ? { status } : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { ad: true },
    });
    return { data, total, page, limit };
  }

  async get(id: string) {
    const row = await this.reportRepo.findOne({ where: { id }, relations: { ad: true } });
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
    } as any);
    return this.get(id);
  }

  async dismiss(id: string, reviewerId: string | undefined, resolution_notes?: string) {
    await this.ensureExists(id);
    await this.reportRepo.update(id, {
      status: 'DISMISSED',
      reviewer_id: reviewerId,
      resolution_notes,
      resolved_at: new Date(),
    } as any);
    return this.get(id);
  }

  async stats() {
    const statuses = ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED'];
    const byStatus = await Promise.all(
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
    const avg = await this.reportRepo
      .createQueryBuilder('r')
      .select('AVG(COALESCE(r.severity,1))', 'avg')
      .getRawOne();
    return { by_status: byStatus, by_type: byType, avg_severity: Number(avg?.avg || 0) };
  }

  private async ensureExists(id: string) {
    const exists = await this.reportRepo.exist({ where: { id } });
    if (!exists) throw new NotFoundException('Report not found');
  }
}
