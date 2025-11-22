import {
  Injectable,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../entities/properties.entity';
import { PropertyApproval } from '../../entities/property-approval.entity';

@Injectable()
export class PropertyApprovalService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(PropertyApproval)
    private readonly approvalRepo: Repository<PropertyApproval>
  ) {}

  async list(page = 1, limit = 10, status?: string) {
    const [data, total] = await this.approvalRepo.findAndCount({
      where: status ? { status } : {},
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: { property: true }
    });
    return { data, total, page, limit };
  }

  async get(id: string) {
    const row = await this.approvalRepo.findOne({
      where: { id },
      relations: { property: true }
    });
    if (!row) throw new NotFoundException('Approval not found');
    return row;
  }

  async getByPropertyId(propertyId: string) {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId }
    });
    if (!property) throw new NotFoundException('Property not found');

    const approval = await this.approvalRepo.findOne({
      where: { property_id: propertyId },
      relations: { property: true },
      order: { created_at: 'DESC' }
    });

    return approval;
  }

  async startReview(propertyId: string, reviewerId: string, comments?: string) {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId }
    });
    if (!property) throw new NotFoundException('Property not found');

    // Check if approval already exists
    const existing = await this.approvalRepo.findOne({
      where: { property_id: propertyId },
      order: { created_at: 'DESC' }
    });

    if (existing && existing.status === 'UNDER_REVIEW') {
      throw new BadRequestException('Property is already under review');
    }

    // Create new approval record
    const approval = this.approvalRepo.create({
      property_id: propertyId,
      status: 'UNDER_REVIEW',
      reviewer_id: reviewerId,
      comments
    });

    await this.approvalRepo.save(approval);
    await this.propertyRepo.update(propertyId, {
      approval_status: 'UNDER_REVIEW'
    });

    return this.approvalRepo.findOne({
      where: { id: approval.id },
      relations: { property: true }
    });
  }

  async approveProperty(
    propertyId: string,
    reviewerId: string,
    comments?: string
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId }
    });
    if (!property) throw new NotFoundException('Property not found');

    // Get or create approval record
    let approval = await this.approvalRepo.findOne({
      where: { property_id: propertyId },
      order: { created_at: 'DESC' }
    });

    if (!approval) {
      // Create approval record if it doesn't exist
      approval = this.approvalRepo.create({
        property_id: propertyId,
        status: 'APPROVED',
        reviewer_id: reviewerId,
        comments,
        resolved_at: new Date()
      });
      await this.approvalRepo.save(approval);
    } else {
      // Update existing approval
      await this.approvalRepo.update(approval.id, {
        status: 'APPROVED',
        comments,
        reviewer_id: reviewerId,
        resolved_at: new Date()
      });
    }

    await this.propertyRepo.update(propertyId, {
      approval_status: 'APPROVED',
      approved_at: new Date(),
      is_published: true
    });

    return this.approvalRepo.findOne({
      where: { id: approval.id },
      relations: { property: true }
    });
  }

  async rejectProperty(
    propertyId: string,
    reviewerId: string,
    rejection_reason: string,
    comments?: string
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId }
    });
    if (!property) throw new NotFoundException('Property not found');

    // Get or create approval record
    let approval = await this.approvalRepo.findOne({
      where: { property_id: propertyId },
      order: { created_at: 'DESC' }
    });

    if (!approval) {
      // Create approval record if it doesn't exist
      approval = this.approvalRepo.create({
        property_id: propertyId,
        status: 'REJECTED',
        reviewer_id: reviewerId,
        rejection_reason,
        comments,
        resolved_at: new Date()
      });
      await this.approvalRepo.save(approval);
    } else {
      // Update existing approval
      await this.approvalRepo.update(approval.id, {
        status: 'REJECTED',
        reviewer_id: reviewerId,
        rejection_reason,
        comments,
        resolved_at: new Date()
      });
    }

    await this.propertyRepo.update(propertyId, {
      approval_status: 'REJECTED',
      approved_at: new Date(),
      is_published: false
    });

    return this.approvalRepo.findOne({
      where: { id: approval.id },
      relations: { property: true }
    });
  }

  async requestChangesForProperty(
    propertyId: string,
    reviewerId: string,
    required_changes: string,
    comments?: string
  ) {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId }
    });
    if (!property) throw new NotFoundException('Property not found');

    // Get or create approval record
    let approval = await this.approvalRepo.findOne({
      where: { property_id: propertyId },
      order: { created_at: 'DESC' }
    });

    if (!approval) {
      // Create approval record if it doesn't exist
      approval = this.approvalRepo.create({
        property_id: propertyId,
        status: 'UNDER_REVIEW',
        reviewer_id: reviewerId,
        requires_changes: true,
        required_changes,
        comments
      });
      await this.approvalRepo.save(approval);
    } else {
      // Update existing approval
      await this.approvalRepo.update(approval.id, {
        status: 'UNDER_REVIEW',
        reviewer_id: reviewerId,
        requires_changes: true,
        required_changes,
        comments
      });
    }

    await this.propertyRepo.update(propertyId, {
      approval_status: 'UNDER_REVIEW'
    });

    return this.approvalRepo.findOne({
      where: { id: approval.id },
      relations: { property: true }
    });
  }

  async stats() {
    const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW'];
    const items = await Promise.all(
      statuses.map(async (s) => ({
        status: s,
        count: await this.approvalRepo.count({ where: { status: s } })
      }))
    );
    return { items, total: items.reduce((a, b) => a + b.count, 0) };
  }
}
