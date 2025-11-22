import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property } from '../../entities/properties.entity';
import { Enquiry } from '../../../user-interactions/entities/enquiry.entity';
import { Favorite } from '../../../user-interactions/entities/favorite.entity';
import { EntityType } from '../../../user-interactions/dto';

@Injectable()
export class PropertyStatsService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(Enquiry)
    private readonly enquiryRepository: Repository<Enquiry>,
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async getPropertyStats(propertyId: string) {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const daysListed = Math.floor(
      (Date.now() - property.created_at.getTime()) / (1000 * 60 * 60 * 24),
    );

    const viewsPerDay = daysListed > 0 ? property.view_count / daysListed : 0;

    // Get similar properties stats for comparison
    const similarProperties = await this.propertyRepository.find({
      where: {
        property_category_id: property.property_category_id,
        city: property.city,
        is_active: true,
      },
      take: 10,
    });

    const avgSimilarViews =
      similarProperties.reduce((sum, p) => sum + p.view_count, 0) /
      similarProperties.length;
    const avgSimilarFavorites =
      similarProperties.reduce((sum, p) => sum + p.favorite_count, 0) /
      similarProperties.length;
    const avgSimilarEnquiries =
      similarProperties.reduce((sum, p) => sum + p.contact_count, 0) /
      similarProperties.length;

    return {
      views: property.view_count,
      favorites: property.favorite_count,
      enquiries: property.contact_count,
      daysListed,
      viewsPerDay: Math.round(viewsPerDay * 100) / 100,
      compareToSimilar: {
        views: Math.round(avgSimilarViews),
        favorites: Math.round(avgSimilarFavorites),
        enquiries: Math.round(avgSimilarEnquiries),
      },
    };
  }

  async getAgentStats(agentId: string) {
    const totalListings = await this.propertyRepository.count({
      where: { owner_id: agentId },
    });

    const activeListings = await this.propertyRepository.count({
      where: { owner_id: agentId, is_active: true, is_published: true },
    });

    // Get enquiries for agent's properties
    const agentProperties = await this.propertyRepository.find({
      where: { owner_id: agentId },
      select: { id: true },
    });

    const propertyIds = agentProperties.map((p) => p.id);

    const totalEnquiries = await this.enquiryRepository.count({
      where: { entity_id: { $in: propertyIds } as any, entity_type: EntityType.PROPERTY },
    });

    const newEnquiries = await this.enquiryRepository.count({
      where: { 
        entity_id: { $in: propertyIds } as any,
        entity_type: EntityType.PROPERTY,
        status: 'new',
      },
    });

    // Calculate response rate and conversion rate
    const respondedEnquiries = await this.enquiryRepository.count({
      where: {
        entity_id: { $in: propertyIds } as any,
        entity_type: EntityType.PROPERTY,
        status: { $ne: 'new' } as any,
      },
    });

    const convertedEnquiries = await this.enquiryRepository.count({
      where: {
        entity_id: { $in: propertyIds } as any,
        entity_type: EntityType.PROPERTY,
        status: 'converted',
      },
    });

    const responseRate = totalEnquiries > 0 ? (respondedEnquiries / totalEnquiries) * 100 : 0;
    const conversionRate = totalEnquiries > 0 ? (convertedEnquiries / totalEnquiries) * 100 : 0;

    return {
      totalListings,
      activeListings,
      totalEnquiries,
      newEnquiries,
      responseRate: Math.round(responseRate * 100) / 100,
      avgResponseTime: 24, // Mock data - would need to calculate from actual response times
      conversionRate: Math.round(conversionRate * 100) / 100,
    };
  }

  async getDashboardStats(user: any) {
    if (user.roles?.includes('admin')) {
      return this.getAdminDashboardStats();
    } else if (user.roles?.includes('agent')) {
      return this.getAgentStats(user.id);
    }

    return null;
  }

  private async getAdminDashboardStats() {
    const totalProperties = await this.propertyRepository.count();
    const activeProperties = await this.propertyRepository.count({
      where: { is_active: true, is_published: true },
    });
    const totalEnquiries = await this.enquiryRepository.count();
    const totalFavorites = await this.favoriteRepository.count();

    return {
      totalProperties,
      activeProperties,
      totalEnquiries,
      totalFavorites,
      totalViews: 0, // Would need to sum all property view counts
    };
  }
}
