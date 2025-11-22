import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UpdateLeadStatusDto } from '../dto';
import { LeadStatus } from '../../../user-interactions/entities/lead-status.entity';
import { Enquiry } from '../../../user-interactions/entities/enquiry.entity';
import { Property } from '../../entities/properties.entity';

@Injectable()
export class PropertyLeadService {
  constructor(
    @InjectRepository(LeadStatus)
    private readonly leadStatusRepository: Repository<LeadStatus>,
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
  ) {}

  async findAll(page = 1, limit = 10, status?: string, assignedToId?: string) {
    const where: any = {
      entity_type: 'property', // Only get property enquiries
    };
    if (status) {
      where.status = status;
    }

    // Using findAndCount with proper TypeORM conditions
    const [enquiries, total] = await this.enquiryRepository.findAndCount({
      where,
      relations: {
        user: true,
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Fetch the properties for these enquiries using In operator
    const propertyIds = enquiries.map(enquiry => enquiry.entity_id);

    let properties: Property[] = [];
    if (propertyIds.length > 0) {
      properties = await this.propertyRepository.find({
        where: {
          id: In(propertyIds)
        },
        relations: { media: true },
      });
    }

    // Create a map for quick property lookup
    const propertyMap = properties.reduce((map, property) => {
      map[property.id] = property;
      return map;
    }, {});

    // Attach property data to enquiries
    const data = enquiries.map(enquiry => ({
      ...enquiry,
      property: propertyMap[enquiry.entity_id] || null
    }));

    return { data, total, page, limit };
  }

  async getLeadStats(userId: string) {
    // Using proper field names based on the entity (snake_case)
    const totalLeads = await this.leadStatusRepository.count({
      where: {
        assigned_to: { id: userId }
      },
    });

    const activeLeads = await this.leadStatusRepository.count({
      where: {
        assigned_to: { id: userId },
        status: 'active',
      },
    });

    const convertedLeads = await this.leadStatusRepository.count({
      where: {
        assigned_to: { id: userId },
        status: 'converted',
      },
    });

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      activeLeads,
      convertedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async updateLeadStatus(enquiryId: string, dto: UpdateLeadStatusDto, userId: string) {
    // Check if enquiry exists
    const enquiry = await this.enquiryRepository.findOne({
      where: { id: enquiryId },
    });

    if (!enquiry) {
      throw new NotFoundException('Enquiry not found');
    }

    // Find existing lead status or create new one
    let leadStatus = await this.leadStatusRepository.findOne({
      where: { enquiry: { id: enquiryId } },
      relations: { enquiry: true, assigned_to: true },
    });

    if (!leadStatus) {
      leadStatus = this.leadStatusRepository.create({
        enquiry: { id: enquiryId },
        status: dto.status,
        notes: dto.notes,
        assigned_to: { id: dto.assignedToId || userId },
        follow_up_date: dto.followUpDate,
      });
    } else {
      leadStatus.status = dto.status;
      if (dto.notes) leadStatus.notes = dto.notes;
      if (dto.assignedToId) {
        leadStatus.assigned_to = { id: dto.assignedToId } as any;
      }
      if (dto.followUpDate) leadStatus.follow_up_date = dto.followUpDate;
    }

    const saved = await this.leadStatusRepository.save(leadStatus);

    // Update enquiry status as well
    await this.enquiryRepository.update(enquiryId, { status: dto.status });

    // Fetch the complete lead status with related data
    const updatedLeadStatus = await this.leadStatusRepository.findOne({
      where: { id: saved.id },
      relations: {
        enquiry: true,
        assigned_to: true,
      },
    });

    // Handle null case explicitly
    if (!updatedLeadStatus) {
      throw new NotFoundException('Updated lead status not found');
    }

    // Fetch the associated property
    if (updatedLeadStatus.enquiry.entity_type === 'property') {
      const property = await this.propertyRepository.findOne({
        where: { id: updatedLeadStatus.enquiry.entity_id },
        relations: { media: true },
      });

      // Attach the property data to the response
      return {
        ...updatedLeadStatus,
        enquiry: {
          ...updatedLeadStatus.enquiry,
          property: property || null
        }
      };
    }

    return updatedLeadStatus;
  }

  async getLeadHistory(enquiryId: string) {
    return this.leadStatusRepository.find({
      where: { enquiry: { id: enquiryId } },
      relations: { assigned_to: true },
      order: { created_at: 'DESC' },
    });
  }
}