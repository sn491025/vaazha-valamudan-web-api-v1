import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdApproval } from '../../entities/ad-approval.entity';
import { Ad } from '../../entities/ad.entity';
import { ApproveAdDto, RejectAdDto, RequestChangesDto } from '../dto/approval-request.dto';

@Injectable()
export class AdApprovalService {
  constructor(
    @InjectRepository(AdApproval)
    private readonly adApprovalRepo: Repository<AdApproval>,
    @InjectRepository(Ad)
    private readonly adRepo: Repository<Ad>,
  ) {}

  async getPendingApprovals(page = 1, limit = 10) {
    const skipCount = (page - 1) * limit;
    const [data, total] = await this.adApprovalRepo.findAndCount({
      where: { status: 'PENDING' },
      order: { created_at: 'ASC' },
      skip: skipCount,
      take: limit,
      relations: {
        ad: { images: true, owner: true, category: true },
      },
    });
    return { data, total, page, limit };
  }

  async submitForApproval(adId: string) {
    const ad = await this.adRepo.findOne({ where: { id: adId } });
    if (!ad) throw new NotFoundException('Ad not found');

    const existingApproval = await this.adApprovalRepo.findOne({
      where: { ad_id: adId, status: 'PENDING' },
    });

    if (existingApproval) return existingApproval;

    const approval = this.adApprovalRepo.create({ ad_id: adId, status: 'PENDING' });
    const saved = await this.adApprovalRepo.save(approval);

    await this.adRepo.update(adId, { approval_status: 'PENDING' });
    return saved;
  }

  // New API to mirror property approvals

  async list(page = 1, limit = 10, status?: string) {
    const skipCount = (page - 1) * limit;
    const whereCondition = status ? { status } : {};
    const [data, total] = await this.adApprovalRepo.findAndCount({
      where: whereCondition,
      order: { created_at: 'DESC' },
      skip: skipCount,
      take: limit,
      relations: {
        ad: { images: true, owner: true, category: true },
        reviewed_by: true,
      },
    });
    return { data, total, page, limit };
  }

  async stats() {
    const [total, pending, approved, rejected, changesRequested] = await Promise.all([
      this.adApprovalRepo.count(),
      this.adApprovalRepo.count({ where: { status: 'PENDING' } }),
      this.adApprovalRepo.count({ where: { status: 'APPROVED' } }),
      this.adApprovalRepo.count({ where: { status: 'REJECTED' } }),
      this.adApprovalRepo.count({ where: { status: 'CHANGES_REQUESTED' } }),
    ]);

    return {
      total,
      pending,
      approved,
      rejected,
      changes_requested: changesRequested,
    };
  }

  async getByAdId(adId: string) {
    const approval = await this.adApprovalRepo.findOne({
      where: { ad_id: adId },
      order: { created_at: 'DESC' },
      relations: { reviewed_by: true, ad: true },
    });
    if (!approval) throw new NotFoundException('Approval not found for this ad');
    return approval;
  }

  async get(id: string) {
    const approval = await this.adApprovalRepo.findOne({
      where: { id },
      relations: { reviewed_by: true, ad: true },
    });
    if (!approval) throw new NotFoundException('Approval not found');
    return approval;
  }

  async approveAd(adId: string, adminId: string, dto: ApproveAdDto) {
    const approval = await this.adApprovalRepo.findOne({
      where: { ad_id: adId, status: 'PENDING' },
    });
    if (!approval) throw new NotFoundException('No pending approval found for this ad');

    await this.adApprovalRepo.update(approval.id, {
      status: 'APPROVED',
      reviewed_by_id: adminId,
      admin_notes: dto.admin_notes,
      reviewed_at: new Date(),
    });

    await this.adRepo.update(adId, {
      approval_status: 'APPROVED',
      approved_at: new Date(),
      is_published: true,
      published_at: new Date(),
    });

    return this.adApprovalRepo.findOne({ where: { id: approval.id }, relations: { ad: true } });
    }

  async rejectAd(adId: string, adminId: string, dto: RejectAdDto) {
    const approval = await this.adApprovalRepo.findOne({
      where: { ad_id: adId, status: 'PENDING' },
    });
    if (!approval) throw new NotFoundException('No pending approval found for this ad');

    await this.adApprovalRepo.update(approval.id, {
      status: 'REJECTED',
      reviewed_by_id: adminId,
      rejection_reason: dto.rejection_reason,
      admin_notes: dto.admin_notes,
      reviewed_at: new Date(),
    });

    await this.adRepo.update(adId, {
      approval_status: 'REJECTED',
      is_published: false,
      published_at: undefined as any,
    });

    return this.adApprovalRepo.findOne({ where: { id: approval.id }, relations: { ad: true } });
  }

  async requestChanges(adId: string, adminId: string, dto: RequestChangesDto) {
    const approval = await this.adApprovalRepo.findOne({
      where: { ad_id: adId, status: 'PENDING' },
    });
    if (!approval) throw new NotFoundException('No pending approval found for this ad');

    await this.adApprovalRepo.update(approval.id, {
      status: 'CHANGES_REQUESTED',
      reviewed_by_id: adminId,
      changes_requested: dto.changes_requested,
      admin_notes: dto.admin_notes,
      reviewed_at: new Date(),
    });

    await this.adRepo.update(adId, {
      approval_status: 'CHANGES_REQUESTED',
      is_published: false,
      published_at: undefined as any,
    });

    return this.adApprovalRepo.findOne({ where: { id: approval.id }, relations: { ad: true } });
  }

  async getAdApprovals(adId: string) {
    return this.adApprovalRepo.find({
      where: { ad_id: adId },
      order: { created_at: 'DESC' },
      relations: { reviewed_by: true },
    });
  }

  async getAllApprovals(page = 1, limit = 10, status?: string) {
    const skipCount = (page - 1) * limit;
    const whereCondition = status ? { status } : {};

    const [data, total] = await this.adApprovalRepo.findAndCount({
      where: whereCondition,
      order: { created_at: 'DESC' },
      skip: skipCount,
      take: limit,
      relations: {
        ad: { images: true, owner: true, category: true },
        reviewed_by: true,
      },
    });
    return { data, total, page, limit };
  }
}
