import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ad } from '../../entities/ad.entity';
import { CreateAdDto } from '../dto/create-ad.dto';
import { UpdateAdDto } from '../dto/update-ad.dto';
import { EntityType } from '../../../user-interactions/dto';
import { Favorite } from '../../../user-interactions/entities/favorite.entity';

@Injectable()
export class AdService {
  constructor(
    @InjectRepository(Ad)
    private readonly adRepo: Repository<Ad>,
    @InjectRepository(Favorite)
    private favRepo: Repository<Favorite>
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    filters: {
      status?: string;
      category_id?: string;
      city?: string;
      approval_status?: string;
    },
    userId?: string
  ) {
    const skipCount = (page - 1) * limit;
    const whereConditions = this.buildWhereConditions(filters);

    const queryOptions = {
      where: whereConditions,
      order: { created_at: 'DESC' as const },
      skip: skipCount,
      take: limit,
      relations: { images: true }
    };

    const [data, total] = await this.adRepo.findAndCount(queryOptions);

    let dataWithFavorites: any = data;

    if (userId) {
      const favoriteEntities = await this.favRepo.find({
        where: {
          user_id: userId,
          entity_type: EntityType.AD
        }
      });

      const favoritePropertyIds = favoriteEntities.map((f) => f.entity_id);

      dataWithFavorites = data.map((property) => ({
        ...property,
        is_user_favorite: favoritePropertyIds.includes(property.id)
      }));
    }

    return { data: dataWithFavorites, total, page, limit };
  }

  async findMyFavorites(
    page = 1,
    limit = 10,
    filters: {
      status?: string;
      category_id?: string;
      city?: string;
      approval_status?: string;
    },
    userId?: string
  ) {
    const skipCount = (page - 1) * limit;

    const favoriteEntities = await this.favRepo.find({
      where: {
        user_id: userId,
        entity_type: EntityType.AD
      }
    });

    const favoritePropertyIds = favoriteEntities.map((f) => f.entity_id);

    if (!favoritePropertyIds.length) {
      return { data: [], total: 0, page, limit };
    }

    const whereConditions = this.buildWhereConditions(filters);
    whereConditions.id = In(favoritePropertyIds);

    const queryOptions = {
      where: whereConditions,
      order: { created_at: 'DESC' as const },
      skip: skipCount,
      take: limit,
      relations: { images: true }
    };

    const [data, total] = await this.adRepo.findAndCount(queryOptions);

    return { data, total, page, limit };
  }

  private buildWhereConditions(filters: {
    status?: string;
    category_id?: string;
    city?: string;
    approval_status?: string;
  }) {
    const conditions: any = { is_active: true };

    if (filters.status) {
      conditions.status = filters.status;
    }

    if (filters.category_id) {
      conditions.category_id = filters.category_id;
    }

    if (filters.city) {
      conditions.city = filters.city;
    }

    if (filters.approval_status) {
      conditions.approval_status = filters.approval_status;
    }

    return conditions;
  }

  async findOne(id: string, userId?: string) {
    const entity = await this.adRepo.findOne({
      where: { id },
      relations: {
        images: true,
        approvals: true,
        reports: true,
        category: true,
        owner: true
      }
    });
    if (!entity) throw new NotFoundException('Ad not found');

    // Increment view count
    await this.adRepo.update(id, { view_count: entity.view_count + 1 });

    let data = { ...entity, is_user_favorite: false };
    if (userId) {
      data.is_user_favorite = !!(await this.favRepo.findOne({
        where: {
          entity_type: EntityType.AD,
          entity_id: entity.id,
          user_id: userId
        }
      }));
    }

    return data;
  }

  async myAds(ownerId: string, page = 1, limit = 10) {
    const skipCount = (page - 1) * limit;
    const [data, total] = await this.adRepo.findAndCount({
      where: { owner_id: ownerId, is_active: true },
      order: { created_at: 'DESC' },
      skip: skipCount,
      take: limit,
      relations: { images: true }
    });
    return { data, total, page, limit };
  }

  async create(dto: CreateAdDto, userId: string) {
    // Validate userId
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Create a new entity instance
    const entity = new Ad();

    // Set required fields
    entity.title = dto.title;
    entity.description = dto.description;
    entity.category_id = dto.category_id;
    entity.price = dto.price;
    entity.city = dto.city;
    entity.door_number = dto.door_number;
    entity.street_name = dto.street_name;
    entity.district = dto.district;
    entity.state = dto.state;
    entity.postal_code = dto.postal_code;
    entity.country = dto.country;
    entity.owner_id = userId;

    // Set optional fields
    entity.price_unit = dto.price_unit || 'USD';
    entity.is_negotiable = dto.is_negotiable || false;
    entity.status = dto.status || 'AVAILABLE';
    entity.address_line = dto.address_line;
    entity.latitude = dto.latitude;
    entity.longitude = dto.longitude;
    entity.contact_name = dto.contact_name;
    entity.contact_phone = dto.contact_phone;
    entity.contact_email = dto.contact_email;
    entity.is_premium = dto.is_premium || false;
    entity.is_featured = dto.is_featured || false;
    entity.slug = dto.slug;
    entity.meta_description = dto.meta_description;
    entity.meta_keywords = dto.meta_keywords;

    // Handle expiry
    if (dto.expires_in_days) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + dto.expires_in_days);
      entity.expires_at = expiresAt;
    }

    // Handle boost settings during creation
    if (dto.is_boosted && dto.boost_duration_days) {
      const boostExpiresAt = new Date();
      boostExpiresAt.setDate(
        boostExpiresAt.getDate() + dto.boost_duration_days
      );
      entity.is_boosted = true;
      entity.active_boost_type = dto.boost_type || 'PREMIUM';
      entity.boost_expires_at = boostExpiresAt;
      entity.boost_priority = dto.boost_priority || 1;
    }

    // Handle top listing settings during creation
    if (dto.is_top_listing && dto.top_listing_duration_days) {
      const topListingExpiresAt = new Date();
      topListingExpiresAt.setDate(
        topListingExpiresAt.getDate() + dto.top_listing_duration_days
      );
      entity.is_top_listing = true;
      entity.top_listing_expires_at = topListingExpiresAt;
    }

    const saved = await this.adRepo.save(entity);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateAdDto) {
    const existing = await this.findOne(id);

    const updateData: any = {
      title: dto.title ?? existing.title,
      description: dto.description ?? existing.description,
      category_id: dto.category_id ?? existing.category_id,
      price: dto.price ?? existing.price,
      price_unit: dto.price_unit ?? existing.price_unit,
      is_negotiable: dto.is_negotiable ?? existing.is_negotiable,
      status: dto.status ?? existing.status,
      door_number: dto.door_number ?? existing.door_number,
      street_name: dto.street_name ?? existing.street_name,
      address_line: dto.address_line ?? existing.address_line,
      city: dto.city ?? existing.city,
      district: dto.district ?? existing.district,
      state: dto.state ?? existing.state,
      postal_code: dto.postal_code ?? existing.postal_code,
      country: dto.country ?? existing.country,
      latitude: dto.latitude ?? existing.latitude,
      longitude: dto.longitude ?? existing.longitude,
      contact_name: dto.contact_name ?? existing.contact_name,
      contact_phone: dto.contact_phone ?? existing.contact_phone,
      contact_email: dto.contact_email ?? existing.contact_email,
      is_premium: dto.is_premium ?? existing.is_premium,
      is_featured: dto.is_featured ?? existing.is_featured,
      slug: dto.slug ?? existing.slug,
      meta_description: dto.meta_description ?? existing.meta_description,
      meta_keywords: dto.meta_keywords ?? existing.meta_keywords,
      is_published: dto.is_published ?? existing.is_published,
      published_at:
        dto.is_published !== undefined
          ? dto.is_published
            ? new Date()
            : undefined
          : existing.published_at
    };

    // Handle expiry updates
    if (dto.expires_in_days !== undefined) {
      if (dto.expires_in_days > 0) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + dto.expires_in_days);
        updateData.expires_at = expiresAt;
      } else {
        updateData.expires_at = null;
      }
    }

    await this.adRepo.update(id, updateData);

    // Handle boost updates
    if (dto.is_boosted !== undefined) {
      if (dto.is_boosted && dto.boost_duration_days) {
        const boostExpiresAt = new Date();
        boostExpiresAt.setDate(
          boostExpiresAt.getDate() + dto.boost_duration_days
        );
        await this.adRepo.update(id, {
          is_boosted: true,
          active_boost_type:
            dto.boost_type || existing.active_boost_type || 'PREMIUM',
          boost_expires_at: boostExpiresAt,
          boost_priority: dto.boost_priority ?? existing.boost_priority ?? 1
        });
      } else if (!dto.is_boosted) {
        await this.adRepo.update(id, {
          is_boosted: false,
          boost_priority: 0
        });
      }
    }

    // Handle top listing updates
    if (dto.is_top_listing !== undefined) {
      if (dto.is_top_listing && dto.top_listing_duration_days) {
        const topListingExpiresAt = new Date();
        topListingExpiresAt.setDate(
          topListingExpiresAt.getDate() + dto.top_listing_duration_days
        );
        await this.adRepo.update(id, {
          is_top_listing: true,
          top_listing_expires_at: topListingExpiresAt
        });
      } else if (!dto.is_top_listing) {
        await this.adRepo.update(id, {
          is_top_listing: false
        });
      }
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.adRepo.delete(id);
    return { success: true };
  }

  async publish(id: string) {
    await this.adRepo.update(id, {
      is_published: true,
      published_at: new Date()
    });
    return this.findOne(id);
  }

  async unpublish(id: string) {
    await this.adRepo.update(id, {
      is_published: false,
      published_at: new Date()
    });
    return this.findOne(id);
  }

  // Ad Boost/Promotion Methods
  async boostAd(
    id: string,
    boostType = 'PREMIUM',
    boostDurationDays = 30,
    priority = 1
  ) {
    const boostExpiresAt = new Date();
    boostExpiresAt.setDate(boostExpiresAt.getDate() + boostDurationDays);

    await this.adRepo.update(id, {
      is_boosted: true,
      active_boost_type: boostType,
      boost_expires_at: boostExpiresAt,
      boost_priority: priority
    });

    return this.findOne(id);
  }

  async makeTopListing(id: string, topListingDurationDays = 7) {
    const topListingExpiresAt = new Date();
    topListingExpiresAt.setDate(
      topListingExpiresAt.getDate() + topListingDurationDays
    );

    await this.adRepo.update(id, {
      is_top_listing: true,
      top_listing_expires_at: topListingExpiresAt
    });

    return this.findOne(id);
  }

  async removeBoost(id: string) {
    await this.adRepo.update(id, {
      is_boosted: false,
      boost_priority: 0
    });

    return this.findOne(id);
  }

  async removeTopListing(id: string) {
    await this.adRepo.update(id, {
      is_top_listing: false
    });

    return this.findOne(id);
  }

  async getBoostedAds(page = 1, limit = 10) {
    const skipCount = (page - 1) * limit;
    const [data, total] = await this.adRepo.findAndCount({
      where: {
        is_active: true,
        is_boosted: true,
        is_published: true
      },
      order: {
        boost_priority: 'DESC',
        boost_expires_at: 'DESC',
        created_at: 'DESC'
      },
      skip: skipCount,
      take: limit,
      relations: { images: true }
    });
    return { data, total, page, limit };
  }

  async getTopListings(page = 1, limit = 10) {
    const skipCount = (page - 1) * limit;
    const [data, total] = await this.adRepo.findAndCount({
      where: {
        is_active: true,
        is_top_listing: true,
        is_published: true
      },
      order: {
        top_listing_expires_at: 'DESC',
        created_at: 'DESC'
      },
      skip: skipCount,
      take: limit,
      relations: { images: true }
    });
    return { data, total, page, limit };
  }

  // Enhanced search with boost priority
  async findAllEnhanced(page = 1, limit = 10) {
    const skipCount = (page - 1) * limit;
    const [data, total] = await this.adRepo.findAndCount({
      where: { is_active: true, is_published: true },
      order: {
        is_top_listing: 'DESC',
        is_boosted: 'DESC',
        boost_priority: 'DESC',
        is_premium: 'DESC',
        is_featured: 'DESC',
        created_at: 'DESC'
      },
      skip: skipCount,
      take: limit,
      relations: { images: true }
    });
    return { data, total, page, limit };
  }

  async incrementContactCount(id: string) {
    const ad = await this.findOne(id);
    await this.adRepo.update(id, { contact_count: ad.contact_count + 1 });
  }

  async incrementClickCount(id: string) {
    const ad = await this.findOne(id);
    await this.adRepo.update(id, { click_count: ad.click_count + 1 });
  }
}
