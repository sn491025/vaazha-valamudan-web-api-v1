import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { FeatureCategory } from '../../entities/feature-category.entity';
import { FeatureOption } from '../../entities/feature-option.entity';
import { CreateFeatureCategoryDto } from '../dto/create-feature-category.dto';
import { UpdateFeatureCategoryDto } from '../dto/update-feature-category.dto';
import { FeatureCategoryResponseDto } from '../dto/feature-category-response.dto';
import { CreateFeatureOptionDto } from '../dto/create-feature-option.dto';
import { UpdateFeatureOptionDto } from '../dto/update-feature-option.dto';
import { FeatureOptionResponseDto } from '../dto/feature-option-response.dto';
import { CreateFeatureCategoryWithOptionsDto } from '../dto/create-feature-category-with-options.dto';
import { UpdateFeatureCategoryWithOptionsDto } from '../dto/update-feature-category-with-options.dto';
import { FeatureOptionUpsertDto } from '../dto/feature-option-upsert.dto';
import { FeatureGroup } from '../../entities/feature-group.entity';

@Injectable()
export class FeatureCategoriesService {
  constructor(
    @InjectRepository(FeatureCategory)
    private readonly categoryRepo: Repository<FeatureCategory>,
    @InjectRepository(FeatureOption)
    private readonly optionRepo: Repository<FeatureOption>,
    @InjectRepository(FeatureGroup)
    private readonly groupRepo: Repository<FeatureGroup>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(activeOnly = true): Promise<FeatureCategoryResponseDto[]> {
    const cats = await this.categoryRepo.find({
      where: activeOnly ? { is_active: true } : {},
      relations: ['options', 'group'],
      order: { sort_order: 'ASC', name: 'ASC' }
    });

    return cats.map((c) => this.toCategoryResponse(c, activeOnly));
  }

  async findOne(
    id: string,
    activeOnly = true
  ): Promise<FeatureCategoryResponseDto> {
    const cat = await this.categoryRepo.findOne({
      where: { id },
      relations: ['options', 'group']
    });
    if (!cat) throw new NotFoundException('Feature category not found');
    return this.toCategoryResponse(cat, activeOnly);
  }

  async create(
    dto: CreateFeatureCategoryDto
  ): Promise<FeatureCategoryResponseDto> {
    const entity = this.categoryRepo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      input_type: dto.inputType,
      is_filterable: dto.isFilterable ?? false,
      is_mandatory: dto.isMandatory ?? false,
      sort_order: dto.sortOrder ?? 0,
      is_active: dto.isActive ?? true
    });
    if (dto.featureGroupId) {
      (entity as any).feature_group_id = dto.featureGroupId;
    }
    const saved = await this.categoryRepo.save(entity);
    return this.findOne(saved.id, false);
  }

  async createWithOptions(
    dto: CreateFeatureCategoryWithOptionsDto
  ): Promise<FeatureCategoryResponseDto> {
    this.validateOptionsAllowed(dto.inputType, dto.options);

    return this.dataSource.transaction(async (manager) => {
      const category = manager.getRepository(FeatureCategory).create({
        code: dto.code,
        name: dto.name,
        description: dto.description,
        input_type: dto.inputType,
        is_filterable: dto.isFilterable ?? false,
        is_mandatory: dto.isMandatory ?? false,
        sort_order: dto.sortOrder ?? 0,
        is_active: dto.isActive ?? true,
        group_id: dto.featureGroupId ?? null
      } as FeatureCategory);

      const savedCategory = await manager
        .getRepository(FeatureCategory)
        .save(category);

      if (dto.options?.length) {
        const toSave = dto.options.map((o) =>
          manager.getRepository(FeatureOption).create({
            name: o.name,
            value: o.value,
            icon: o.icon,
            sort_order: o.sortOrder ?? 0,
            is_active: o.isActive ?? true,
            feature_category_id: savedCategory.id
          })
        );
        await manager.getRepository(FeatureOption).save(toSave);
      }

      const reloaded = await manager.getRepository(FeatureCategory).findOne({
        where: { id: savedCategory.id },
        relations: ['options']
      });
      return this.toCategoryResponse(reloaded!, false);
    });
  }

  async update(
    id: string,
    dto: UpdateFeatureCategoryDto
  ): Promise<FeatureCategoryResponseDto> {
    const entity = await this.categoryRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Feature category not found');
    entity.name = dto.name ?? entity.name;
    entity.description = dto.description ?? entity.description;
    entity.input_type = dto.inputType ?? entity.input_type;
    entity.is_filterable = dto.isFilterable ?? entity.is_filterable;
    entity.is_mandatory = dto.isMandatory ?? entity.is_mandatory;
    entity.sort_order = dto.sortOrder ?? entity.sort_order;
    if (typeof dto.featureGroupId !== 'undefined') {
      (entity as any).feature_group_id = dto.featureGroupId;
    }
    const saved = await this.categoryRepo.save(entity);
    return this.findOne(saved.id, false);
  }

  async updateWithOptions(
    id: string,
    dto: UpdateFeatureCategoryWithOptionsDto
  ): Promise<FeatureCategoryResponseDto> {
    // Find the category with its relations
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['options', 'group']
    });
    if (!category) throw new NotFoundException('Feature category not found');


    return this.dataSource.transaction(async (manager) => {
      const catRepo = manager.getRepository(FeatureCategory);
      const optRepo = manager.getRepository(FeatureOption);

      // Update category fields
      await this.updateCategoryFields(category, dto);

      // Validate options are allowed for this input type
      this.validateOptionsAllowed(category.input_type, dto.options);

      // Save category changes
      await catRepo.save(category);

      // Handle options based on input type
      const isSelectType = ['single_select', 'multi_select'].includes(
        category.input_type
      );

      if (!isSelectType) {
        // If not select type, deactivate all options
        if (category.options?.length) {
          await optRepo.update(
            { feature_category_id: category.id },
            { is_active: false }
          );
        }
      } else if (dto.options) {
        // Process options for select types
        await this.processOptionsChanges(category, dto.options, optRepo);
      }

      // Return updated category with fresh relations
      const reloaded = await catRepo.findOne({
        where: { id: category.id },
        relations: ['options', 'group']
      });
      return this.toCategoryResponse(reloaded!, false);
    });
  }

  // Helper method to update category fields
  async updateCategoryFields(
    category: FeatureCategory,
    dto: UpdateFeatureCategoryWithOptionsDto
  ) {
    category.name = dto.name ?? category.name;
    if (dto.featureGroupId) {
      let group = await this.groupRepo.findOne({
        where: { id: dto.featureGroupId }
      });
      if(!group) throw new NotFoundException('Feature group not found');
      category.group = group as any as FeatureGroup;
      category.group_id = dto.featureGroupId;
    }

    category.description = dto.description ?? category.description;
    category.input_type = dto.inputType ?? category.input_type;
    category.is_filterable = dto.isFilterable ?? category.is_filterable;
    category.is_mandatory = dto.isMandatory ?? category.is_mandatory;
    category.sort_order = dto.sortOrder ?? category.sort_order;
  }

  // Helper method to process options changes
  private async processOptionsChanges(
    category: FeatureCategory,
    newOptions: FeatureOptionUpsertDto[],
    optRepo: Repository<FeatureOption>
  ): Promise<void> {
    // Map existing options by ID for easy lookup
    const existingById = new Map(
      (category.options || []).map((o) => [o.id, o])
    );

    // Track which existing options are being kept
    const processedIds = new Set<string>();

    // Prepare collections for create and update operations
    const toCreate: FeatureOption[] = [];
    const toUpdate: FeatureOption[] = [];

    // Process each option from the payload
    for (const payload of newOptions) {
      if (payload.id && existingById.has(payload.id)) {
        // Update existing option
        const existing = existingById.get(payload.id)!;
        existing.name = payload.name ?? existing.name;
        existing.value = payload.value ?? existing.value;
        existing.icon = payload.icon ?? existing.icon;
        existing.sort_order = payload.sortOrder ?? existing.sort_order;
        if (typeof payload.isActive === 'boolean')
          existing.is_active = payload.isActive;

        toUpdate.push(existing);
        processedIds.add(payload.id);
      } else {
        // Create new option
        toCreate.push(
          optRepo.create({
            feature_category_id: category.id,
            name: payload.name,
            value: payload.value,
            icon: payload.icon,
            sort_order: payload.sortOrder ?? 0,
            is_active: payload.isActive ?? true
          })
        );
      }
    }

    // Save created and updated options
    if (toCreate.length) await optRepo.save(toCreate);
    if (toUpdate.length) await optRepo.save(toUpdate);

    // Find options that need to be deactivated (existing but not in payload)
    const toDeactivate = (category.options || [])
      .filter((o) => !processedIds.has(o.id) && o.is_active)
      .map((o) => o.id);

    if (toDeactivate.length) {
      await optRepo.update({ id: In(toDeactivate) }, { is_active: false });
    }
  }

  async updateStatus(
    id: string,
    isActive: boolean
  ): Promise<FeatureCategoryResponseDto> {
    const entity = await this.categoryRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Feature category not found');
    entity.is_active = isActive;
    await this.categoryRepo.save(entity);
    return this.findOne(id, false);
  }

  // Options (fine-grained)

  async listOptions(
    featureCategoryId: string,
    activeOnly = true
  ): Promise<FeatureOptionResponseDto[]> {
    const options = await this.optionRepo.find({
      where: activeOnly
        ? { feature_category_id: featureCategoryId, is_active: true }
        : { feature_category_id: featureCategoryId },
      order: { sort_order: 'ASC', name: 'ASC' }
    });
    return options.map((o) => this.toOptionResponse(o));
  }

  async createOption(
    featureCategoryId: string,
    dto: CreateFeatureOptionDto
  ): Promise<FeatureOptionResponseDto> {
    await this.ensureCategoryExists(featureCategoryId);
    const entity = this.optionRepo.create({
      feature_category_id: featureCategoryId,
      name: dto.name,
      value: dto.value,
      sort_order: dto.sortOrder ?? 0,
      is_active: dto.isActive ?? true
    });
    const saved = await this.optionRepo.save(entity);
    return this.toOptionResponse(saved);
  }

  async updateOption(
    featureCategoryId: string,
    optionId: string,
    dto: UpdateFeatureOptionDto
  ): Promise<FeatureOptionResponseDto> {
    await this.ensureCategoryExists(featureCategoryId);
    const entity = await this.optionRepo.findOne({
      where: { id: optionId, feature_category_id: featureCategoryId }
    });
    if (!entity) throw new NotFoundException('Feature option not found');
    entity.name = dto.name ?? entity.name;
    entity.value = dto.value ?? entity.value;
    entity.sort_order = dto.sortOrder ?? entity.sort_order;
    const saved = await this.optionRepo.save(entity);
    return this.toOptionResponse(saved);
  }

  async updateOptionStatus(
    featureCategoryId: string,
    optionId: string,
    isActive: boolean
  ): Promise<FeatureOptionResponseDto> {
    await this.ensureCategoryExists(featureCategoryId);
    const entity = await this.optionRepo.findOne({
      where: { id: optionId, feature_category_id: featureCategoryId }
    });
    if (!entity) throw new NotFoundException('Feature option not found');
    entity.is_active = isActive;
    const saved = await this.optionRepo.save(entity);
    return this.toOptionResponse(saved);
  }

  private toCategoryResponse(
    c: FeatureCategory,
    activeOnly: boolean
  ): FeatureCategoryResponseDto {
    const options = (c.options ?? [])
      .filter((o) => (activeOnly ? o.is_active : true))
      .sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
      );

    const featureGroupId = c.group_id ?? c.group?.id ?? null;
    const featureGroupName = c.group?.name ?? null;
    const featureGroupSortOrder = c.group?.sort_order ?? null;

    return {
      id: c.id,
      code: c.code,
      name: c.name,
      featureGroupId,
      featureGroupName,
      featureGroupSortOrder,
      description: c.description ?? undefined,
      inputType: c.input_type as any,
      isFilterable: c.is_filterable,
      isMandatory: c.is_mandatory,
      sortOrder: c.sort_order,
      isActive: c.is_active,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      options: options.map((o) => this.toOptionResponse(o))
    };
  }

  private toOptionResponse(o: FeatureOption): FeatureOptionResponseDto {
    return {
      id: o.id,
      name: o.name,
      value: o.value ?? undefined,
      icon: o.icon ?? undefined,
      sortOrder: o.sort_order,
      isActive: o.is_active,
      featureCategoryId: o.feature_category_id,
      createdAt: o.created_at,
      updatedAt: o.updated_at
    };
  }

  private async ensureCategoryExists(id: string): Promise<void> {
    const exists = await this.categoryRepo.exist({ where: { id } });
    if (!exists) throw new NotFoundException('Feature category not found');
  }

  private validateOptionsAllowed(inputType: string, options?: Array<unknown>) {
    const isSelect = ['single_select', 'multi_select'].includes(
      inputType as any
    );
    if (!isSelect && options && options.length > 0) {
      throw new BadRequestException(
        'Options are only allowed for single_select or multi_select feature categories'
      );
    }
  }
}
