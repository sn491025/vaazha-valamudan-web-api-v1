import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { PropertyCategoryFeatureMapping } from '../../entities/property-category-feature-mapping.entity';
import { PropertyCategory } from '../../entities/property-category.entity';
import { FeatureCategory } from '../../entities/feature-category.entity';
import { PropertyMappingBatchRequestDto } from '../dto/property-mapping-batch-request.dto';
import { PropertyMappingBatchResponseDto } from '../dto/property-mapping-batch-response.dto';

@Injectable()
export class PropertyCategoryFeatureMappingsService {
  constructor(
    @InjectRepository(PropertyCategoryFeatureMapping)
    private readonly mappingRepo: Repository<PropertyCategoryFeatureMapping>,
    @InjectRepository(PropertyCategory)
    private readonly propertyCategoryRepo: Repository<PropertyCategory>,
    @InjectRepository(FeatureCategory)
    private readonly featureCategoryRepo: Repository<FeatureCategory>,
    private readonly dataSource: DataSource
  ) {}

  async getBatch(
    propertyCategoryId: string
  ): Promise<PropertyMappingBatchResponseDto> {
    const propertyCategory = await this.propertyCategoryRepo.findOne({
      where: { id: propertyCategoryId }
    });
    if (!propertyCategory) {
      throw new NotFoundException('Property category not found');
    }

    const mappings = await this.mappingRepo.find({
      where: { property_category_id: propertyCategoryId }
    });
    const featureIds = mappings.map((m) => m.feature_category_id);
    const features = featureIds.length
      ? await this.featureCategoryRepo.find({
          where: { id: In(featureIds) },
          relations: ['group', 'options']
        })
      : [];

    const featureById = new Map(features.map((f) => [f.id, f]));

    const response: PropertyMappingBatchResponseDto = {
      property_category_id: propertyCategory.id,
      property_category_name: propertyCategory.name,
      mappings: mappings.map((m) => {
        const fc = featureById.get(m.feature_category_id);
        return {
          feature_category_id: m.feature_category_id,
          feature_category_name: fc?.name ?? '',
          feature_category_code: fc?.code ?? '',
          description: fc?.description ?? null,
          input_type: fc?.input_type ?? 'text',
          feature_group_id: fc?.group?.id ?? null,
          feature_group_name: fc?.group?.name ?? 'Uncategorized',
          feature_group_sort_order: fc?.group?.sort_order ?? 0,
          is_mandatory: fc?.is_mandatory ?? false,
          is_filterable: fc?.is_filterable ?? false,
          sort_order: fc?.sort_order ?? 0,
          is_active: m.is_active,
          options: (fc?.options ?? []).map((opt) => ({
            id: opt.id,
            name: opt.name,
            value: opt.value ?? null,
            icon: opt.icon ?? null,
            sort_order: opt.sort_order,
            is_active: opt.is_active
          }))
        };
      })
    };

    return response;
  }

  async applyBatch(
    dto: PropertyMappingBatchRequestDto
  ): Promise<PropertyMappingBatchResponseDto> {
    const propertyCategory = await this.propertyCategoryRepo.findOne({
      where: { id: dto.property_category_id }
    });
    if (!propertyCategory) {
      throw new NotFoundException('Property category not found');
    }

    return this.dataSource.transaction(async (manager) => {
      const mRepo = manager.getRepository(PropertyCategoryFeatureMapping);
      const fRepo = manager.getRepository(FeatureCategory);

      // Load existing mappings for the property category
      const existingMappings = await mRepo.find({
        where: { property_category_id: dto.property_category_id }
      });
      const existingMapByFeatureId = new Map(
        existingMappings.map((m) => [m.feature_category_id, m])
      );

      const incomingFeatureIds = new Set<string>();

      // Upsert feature category attributes and mapping records
      for (const item of dto.mappings.filter((m) => m.is_active) || []) {
        incomingFeatureIds.add(item.feature_category_id);

        const feature = await fRepo.findOne({
          where: { id: item.feature_category_id }
        });
        if (!feature) {
          throw new NotFoundException(
            `Feature category not found: ${item.feature_category_id}`
          );
        }

        // Update feature category global attributes as per request
        feature.is_mandatory = item.is_mandatory;
        feature.is_filterable = item.is_filterable;
        feature.sort_order = item.sort_order ?? feature.sort_order;
        await fRepo.save(feature);

        // Upsert mapping
        const existing = existingMapByFeatureId.get(item.feature_category_id);
        if (existing) {
          if (item.is_active) {
            existing.is_active = item.is_active;
            await mRepo.save(existing);
          }
          else {
            await mRepo.delete(existing.id);
          }
        } else {
          const created = mRepo.create({
            property_category_id: dto.property_category_id,
            feature_category_id: item.feature_category_id,
            is_active: item.is_active
          });
          await mRepo.save(created);
        }
      }

      // Deactivate omitted mappings
      const toDeactivate = existingMappings
        .filter(
          (m) => !incomingFeatureIds.has(m.feature_category_id) && m.is_active
        )
        .map((m) => m.id);
      if (toDeactivate.length) {
        await mRepo.delete({ id: In(toDeactivate) });
      }

      // Prepare response snapshot using the up-to-date data
      return this.getBatch(dto.property_category_id);
    });
  }
}
