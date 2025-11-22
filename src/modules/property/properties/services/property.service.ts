import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Property } from '../../entities/properties.entity';
import { PropertyFeatureValue } from '../../entities/property-feature-value.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyFeatureValueDto } from '../dto/property-feature-value.dto';
import { FeatureGroup } from '../../../master/entities/feature-group.entity';
import { FeatureCategory } from '../../../master/entities/feature-category.entity';
import { FeatureOption } from '../../../master/entities/feature-option.entity';
import { InputType } from '../../../master/enums/InputType';
import { PropertyFeatureValueResponseDto } from '../dto/property-feature-value-response.dto';
import { PropertyResponseDto } from '../dto/property-response.dto';
import { Favorite } from '../../../user-interactions/entities/favorite.entity';
import { EntityType } from '../../../user-interactions/dto';
import { User } from '../../../users';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>,
    @InjectRepository(PropertyFeatureValue)
    private readonly featureRepo: Repository<PropertyFeatureValue>,
    @InjectRepository(FeatureGroup)
    private featureGroupRepo: Repository<FeatureGroup>,
    @InjectRepository(FeatureCategory)
    private featureCategoryRepo: Repository<FeatureCategory>,
    @InjectRepository(FeatureOption)
    private featureOptionRepo: Repository<FeatureOption>,
    @InjectRepository(Favorite)
    private favRepo: Repository<Favorite>
  ) {}

  async findAll(
    page = 1,
    limit = 10,
    filters: {
      status: string | undefined;
      listing_type: string | undefined;
      approval_status?: string | null;
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
      relations: { media: true }
    };

    const [data, total] = await this.propertyRepo.findAndCount(queryOptions);

    let dataWithFavorites = data;

    if (userId) {
      const favoriteEntities = await this.favRepo.find({
        where: {
          user_id: userId,
          entity_type: EntityType.PROPERTY
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
      status: string | undefined;
      listing_type: string | undefined;
      approval_status?: string | null;
    },
    userId?: string
  ) {
    const skipCount = (page - 1) * limit;

    const favoriteEntities = await this.favRepo.find({
      where: {
        user_id: userId,
        entity_type: EntityType.PROPERTY
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
      relations: { media: true }
    };

    const [data, total] = await this.propertyRepo.findAndCount(queryOptions);

    return { data, total, page, limit };
  }

  private buildWhereConditions(filters: {
    status: string | undefined;
    listing_type: string | undefined;
    approval_status?: string | null;
  }) {
    const conditions: any = { is_active: true };

    if (filters.status) {
      conditions.status = filters.status;
    }

    if (filters.status) {
      conditions.status = filters.status;
    }

    if (filters.listing_type) {
      conditions.listing_type = filters.listing_type;
    }

    return conditions;
  }

  async findOne(id: string, userId?: string): Promise<PropertyResponseDto> {
    // First fetch the property with basic relations
    const entity = await this.propertyRepo.findOne({
      where: { id },
      relations: {
        media: true,
        approvals: true,
        feature_values: true,
        reports: true
      }
    });

    if (!entity) throw new NotFoundException('Property not found');

    // Create response DTO by copying the entity
    const responseDto: PropertyResponseDto = {
      ...entity
    } as any as PropertyResponseDto;

    // Then enrich the feature_values with additional data
    if (entity.feature_values && entity.feature_values.length > 0) {
      // Get all related IDs for efficient querying
      const featureGroupIds: string[] = entity.feature_values
        .filter((fv) => fv.feature_group_id)
        .map((fv) => fv.feature_group_id);

      const featureCategoryIds: string[] = entity.feature_values.map(
        (fv) => fv.feature_category_id
      );

      const featureOptionIds: string[] = entity.feature_values.flatMap(
        (fv) => fv.feature_option_ids || []
      );

      // Fetch related data in bulk
      const featureGroups = featureGroupIds.length
        ? await this.featureGroupRepo.find({
            where: { id: In(featureGroupIds) }
          })
        : [];

      const featureCategories = await this.featureCategoryRepo.find({
        where: { id: In(featureCategoryIds) }
      });

      const featureOptions = featureOptionIds.length
        ? await this.featureOptionRepo.find({
            where: { id: In(featureOptionIds) }
          })
        : [];

      // Map data to each feature value
      responseDto.feature_values = entity.feature_values.map((fv) => {
        // Get related objects
        const featureGroup = fv.feature_group_id
          ? featureGroups.find((fg) => fg.id === fv.feature_group_id)
          : null;

        const featureCategory = featureCategories.find(
          (fc) => fc.id === fv.feature_category_id
        );

        // Transform feature options based on input_type
        let displayValue: string | null = null;
        let featureOptionsData: FeatureOption[] = [];

        if (featureCategory) {
          const categoryInputType = featureCategory.input_type as string;

          // Handle different input types
          if (
            [InputType.SINGLE_SELECT, InputType.MULTI_SELECT].includes(
              categoryInputType as InputType
            )
          ) {
            featureOptionsData = (fv.feature_option_ids || [])
              .map((optionId) => {
                const option = featureOptions.find(
                  (opt) => opt.id === optionId
                );
                return option ? option : null;
              })
              .filter(Boolean) as FeatureOption[];

            displayValue = featureOptionsData.map((opt) => opt.name).join(', ');
          } else if (categoryInputType === InputType.NUMERIC) {
            displayValue = String(fv.values);
          } else if (categoryInputType === InputType.TEXT) {
            displayValue = String(fv.values);
          } else if (categoryInputType === InputType.BOOLEAN) {
            displayValue = fv.values ? 'Yes' : 'No';
          } else if (categoryInputType === InputType.UNITS) {
            displayValue = `${fv.values} ${fv.units || ''}`;
          }
        }

        // Create enhanced feature value DTO
        const featureValueDto: PropertyFeatureValueResponseDto = {
          ...fv,
          feature_group: featureGroup,
          feature_category: featureCategory,
          feature_options: featureOptionsData,
          display_value: displayValue
        };

        return featureValueDto;
      });
    }

    if (userId) {
      responseDto.is_user_favorite = !!(await this.favRepo.findOne({
        where: {
          entity_type: EntityType.PROPERTY,
          entity_id: responseDto.id,
          user_id: userId
        }
      }));
    }

    return responseDto;
  }

  async myProperties(ownerId: string, page = 1, limit = 10) {
    const [data, total] = await this.propertyRepo.findAndCount({
      where: { owner_id: ownerId, is_active: true },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    });
    return { data, total, page, limit };
  }

  async create(dto: CreatePropertyDto, ownerId: string) {
    const entity = this.propertyRepo.create(dto as any as Property);
    (entity as any).owner_id = ownerId;

    if (dto.is_published) {
      (entity as any).is_published = true;
      (entity as any).published_at = new Date();
    }

    // Handle boost settings during creation (subscription feature)
    if (dto.is_boosted && dto.boost_duration_days) {
      const boostExpiresAt = new Date();
      boostExpiresAt.setDate(
        boostExpiresAt.getDate() + dto.boost_duration_days
      );
      (entity as any).is_boosted = true;
      (entity as any).boost_expires_at = boostExpiresAt;
      (entity as any).boost_priority = dto.boost_priority || 1;
    }

    // Handle top listing settings during creation (premium subscription feature)
    if (dto.is_top_listing && dto.top_listing_duration_days) {
      const topListingExpiresAt = new Date();
      topListingExpiresAt.setDate(
        topListingExpiresAt.getDate() + dto.top_listing_duration_days
      );
      (entity as any).is_top_listing = true;
      (entity as any).top_listing_expires_at = topListingExpiresAt;
    }

    const saved: Property = await this.propertyRepo.save(entity as any);

    if (dto.features?.length) {
      await this.replaceFeatures(saved.id, dto.features);
    }

    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdatePropertyDto) {
    const existing = await this.findOne(id);
    await this.propertyRepo.update(id, {
      title: dto.title ?? existing.title,
      description: dto.description ?? existing.description,
      property_category_id:
        dto.property_category_id ?? existing.property_category_id,
      price: dto.price ?? existing.price,
      price_unit: dto.price_unit ?? existing.price_unit,
      property_size: dto.property_size ?? existing.property_size,
      property_size_unit: dto.property_size_unit ?? existing.property_size_unit,
      listing_type: dto.listing_type ?? existing.listing_type,
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
      agent_id: dto.agent_id ?? existing.agent_id,
      // Contact Information
      contact_name: dto.contact_name ?? existing.contact_name,
      contact_phone: dto.contact_phone ?? existing.contact_phone,
      contact_email: dto.contact_email ?? existing.contact_email,
      is_published: dto.is_published ?? existing.is_published,
      published_at:
        dto.is_published !== undefined
          ? dto.is_published
            ? new Date()
            : null
          : existing.published_at
    } as any);

    // Handle boost updates
    if (dto.is_boosted !== undefined) {
      if (dto.is_boosted && dto.boost_duration_days) {
        const boostExpiresAt = new Date();
        boostExpiresAt.setDate(
          boostExpiresAt.getDate() + dto.boost_duration_days
        );
        await this.propertyRepo.update(id, {
          is_boosted: true,
          boost_expires_at: boostExpiresAt,
          boost_priority: dto.boost_priority || existing.boost_priority || 1
        } as any);
      } else if (!dto.is_boosted) {
        await this.propertyRepo.update(id, {
          is_boosted: false,
          boost_expires_at: null,
          boost_priority: 0
        } as any);
      }
    }

    // Handle top listing updates
    if (dto.is_top_listing !== undefined) {
      if (dto.is_top_listing && dto.top_listing_duration_days) {
        const topListingExpiresAt = new Date();
        topListingExpiresAt.setDate(
          topListingExpiresAt.getDate() + dto.top_listing_duration_days
        );
        await this.propertyRepo.update(id, {
          is_top_listing: true,
          top_listing_expires_at: topListingExpiresAt
        } as any);
      } else if (!dto.is_top_listing) {
        await this.propertyRepo.update(id, {
          is_top_listing: false,
          top_listing_expires_at: null
        } as any);
      }
    }

    if (dto.features) {
      await this.replaceFeatures(id, dto.features);
    }

    return this.findOne(id);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.propertyRepo.delete(id);
    return { success: true };
  }

  async publish(id: string) {
    await this.propertyRepo.update(id, {
      is_published: true,
      published_at: new Date()
    } as any);
    return this.findOne(id);
  }

  async unpublish(id: string) {
    await this.propertyRepo.update(id, {
      is_published: false,
      published_at: null
    } as any);
    return this.findOne(id);
  }

  async replaceFeatures(
    propertyId: string,
    features: PropertyFeatureValueDto[]
  ) {
    await this.featureRepo.delete({ property_id: propertyId as any });

    const rows = (features || []).map((f) => {
      // Normalize primitive values into a single string column
      const valueString =
        f.value_text !== undefined && f.value_text !== null
          ? f.value_text
          : f.value_number !== undefined && f.value_number !== null
            ? String(f.value_number)
            : f.value_boolean !== undefined && f.value_boolean !== null
              ? String(Boolean(f.value_boolean))
              : undefined;

      return this.featureRepo.create({
        property_id: propertyId,
        feature_category_id: f.feature_category_id,
        feature_group_id: f.feature_group_id,
        // Multi-select: keep array of IDs; Single-select: allow array with single value for compatibility
        feature_option_ids:
          f.option_ids ?? (f.option_id ? [f.option_id] : undefined),
        // Single-select relation (optional, persisted via join column)
        feature_option: f.option_id ? ({ id: f.option_id } as any) : undefined,
        // Numeric/Text/Boolean value serialized as string for storage
        values: valueString,
        is_verified: false
      } as any);
    });

    if (rows.length) {
      await this.featureRepo.save(rows as any);
    }
  }

  // Property Boost/Promotion Methods (Subscription Features)
  async boostProperty(
    id: string,
    boostDurationDays: number = 30,
    priority: number = 1
  ) {
    const boostExpiresAt = new Date();
    boostExpiresAt.setDate(boostExpiresAt.getDate() + boostDurationDays);

    await this.propertyRepo.update(id, {
      is_boosted: true,
      boost_expires_at: boostExpiresAt,
      boost_priority: priority
    } as any);

    return this.findOne(id);
  }

  async makeTopListing(id: string, topListingDurationDays: number = 7) {
    const topListingExpiresAt = new Date();
    topListingExpiresAt.setDate(
      topListingExpiresAt.getDate() + topListingDurationDays
    );

    await this.propertyRepo.update(id, {
      is_top_listing: true,
      top_listing_expires_at: topListingExpiresAt
    } as any);

    return this.findOne(id);
  }

  async removeBoost(id: string) {
    await this.propertyRepo.update(id, {
      is_boosted: false,
      boost_expires_at: null,
      boost_priority: 0
    } as any);

    return this.findOne(id);
  }

  async removeTopListing(id: string) {
    await this.propertyRepo.update(id, {
      is_top_listing: false,
      top_listing_expires_at: null
    } as any);

    return this.findOne(id);
  }

  async getBoostedProperties(page = 1, limit = 10) {
    const [data, total] = await this.propertyRepo.findAndCount({
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
      skip: (page - 1) * limit,
      take: limit,
      relations: { media: true }
    });
    return { data, total, page, limit };
  }

  async getTopListings(page = 1, limit = 10) {
    const [data, total] = await this.propertyRepo.findAndCount({
      where: {
        is_active: true,
        is_top_listing: true,
        is_published: true
      },
      order: {
        top_listing_expires_at: 'DESC',
        created_at: 'DESC'
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: { media: true }
    });
    return { data, total, page, limit };
  }

  // Enhanced search with boost priority
  async findAllEnhanced(page = 1, limit = 10) {
    const [data, total] = await this.propertyRepo.findAndCount({
      where: { is_active: true, is_published: true },
      order: {
        is_top_listing: 'DESC',
        is_boosted: 'DESC',
        boost_priority: 'DESC',
        is_premium: 'DESC',
        is_featured: 'DESC',
        created_at: 'DESC'
      },
      skip: (page - 1) * limit,
      take: limit,
      relations: { media: true }
    });
    return { data, total, page, limit };
  }
}
