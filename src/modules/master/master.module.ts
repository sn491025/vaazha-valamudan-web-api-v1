import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyCategory } from './entities/property-category.entity';
import { PropertyCategoryFeatureMapping } from './entities/property-category-feature-mapping.entity';
import { FeatureCategory } from './entities/feature-category.entity';
import { FeatureOption } from './entities/feature-option.entity';
import { FeatureGroup } from './entities/feature-group.entity';
import { PropertyCategoriesController } from './property-category/property-category.controller';
import { FeatureCategoriesController } from './feature-category/feature-category.controller';
import { PropertyCategoryFeatureMappingsController } from './property-mapping/property-mapping.controller';
import { FeatureGroupsController } from './feature-group/feature-group.controller';
import { PropertyCategoriesService } from './property-category/services/property-categories.service';
import { FeatureCategoriesService } from './feature-category/services/feature-categories.service';
import { PropertyCategoryFeatureMappingsService } from './property-mapping/services/property-category-feature-mappings.service';
import { FeatureGroupsService } from './feature-group/services/feature-groups.service';
import { AdCategory } from './entities/ad-category.entity';
import { AdsCategoryService } from './ads-category/services/ads-category.service';
import { AdsCategoryController } from './ads-category/ads-category.controller';

const services = [
  AdsCategoryService,
  PropertyCategoriesService,
  FeatureCategoriesService,
  PropertyCategoryFeatureMappingsService,
  FeatureGroupsService
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdCategory,
      PropertyCategory,
      PropertyCategoryFeatureMapping,
      FeatureCategory,
      FeatureOption,
      FeatureGroup
    ])
  ],
  controllers: [
    AdsCategoryController,
    PropertyCategoriesController,
    FeatureCategoriesController,
    PropertyCategoryFeatureMappingsController,
    FeatureGroupsController
  ],
  providers: services,
  exports: [...services, TypeOrmModule]
})
export class MasterModule {}
