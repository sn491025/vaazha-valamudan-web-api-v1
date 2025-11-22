import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PropertyCategoryFeatureMappingsService } from './services/property-category-feature-mappings.service';
import { PropertyMappingBatchRequestDto } from './dto/property-mapping-batch-request.dto';
import { PropertyMappingBatchResponseDto } from './dto/property-mapping-batch-response.dto';

@ApiTags('Property Category Feature Mappings')
@Controller('master/property-mapping')
export class PropertyCategoryFeatureMappingsController {
  constructor(private readonly service: PropertyCategoryFeatureMappingsService) {}

  @ApiOperation({
    summary: 'Get property mappings (batch)',
    description: 'Returns the mapping snapshot for a property category, including feature flags, active states, and all feature category details with their options.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mappings snapshot with complete feature details',
    type: PropertyMappingBatchResponseDto,
    example: {
      property_category_id: 'a1b2c3d4-1111-2222-3333-444444444444',
      property_category_name: 'Apartment',
      mappings: [
        {
          feature_category_id: 'f001-bhk-0001',
          feature_category_name: 'BHK',
          feature_category_code: 'BHK',
          description: 'Number of bedrooms, halls, and kitchens',
          input_type: 'single_select',
          feature_group_id: '99999999-8888-7777-6666-555555555555',
          feature_group_name: 'Area Details',
          feature_group_sort_order: 1,
          is_mandatory: true,
          is_filterable: true,
          sort_order: 1,
          is_active: true,
          options: [
            {
              id: '323e4567-e89b-12d3-a456-426614174000',
              name: '1 BHK',
              value: '1BHK',
              icon: null,
              sort_order: 1,
              is_active: true,
            },
            {
              id: '423e4567-e89b-12d3-a456-426614174001',
              name: '2 BHK',
              value: '2BHK',
              icon: null,
              sort_order: 2,
              is_active: true,
            },
          ],
        },
        {
          feature_category_id: 'f002-facing-0002',
          feature_category_name: 'Facing',
          feature_category_code: 'FACING',
          description: 'Direction the property faces',
          input_type: 'single_select',
          feature_group_id: '99999999-8888-7777-6666-555555555555',
          feature_group_name: 'Area Details',
          feature_group_sort_order: 1,
          is_mandatory: false,
          is_filterable: true,
          sort_order: 2,
          is_active: true,
          options: [
            {
              id: '523e4567-e89b-12d3-a456-426614174002',
              name: 'East',
              value: 'EAST',
              icon: 'compass-east',
              sort_order: 1,
              is_active: true,
            },
            {
              id: '623e4567-e89b-12d3-a456-426614174003',
              name: 'West',
              value: 'WEST',
              icon: 'compass-west',
              sort_order: 2,
              is_active: true,
            },
          ],
        },
      ],
    },
  })
  @Get(':propertyCategoryId')
  getMappings(@Param('propertyCategoryId') propertyCategoryId: string): Promise<PropertyMappingBatchResponseDto> {
    return this.service.getBatch(propertyCategoryId);
  }

  @ApiOperation({
    summary: 'Apply property mappings (batch)',
    description: 'Create or update mappings for a property category in a single request. Missing mappings will be deactivated.',
  })
  @ApiBody({
    type: PropertyMappingBatchRequestDto,
    examples: {
      sample: {
        summary: 'Apartment -> features',
        value: {
          property_category_id: 'a1b2c3d4-1111-2222-3333-444444444444',
          property_category_name: 'Apartment',
          mappings: [
            {
              feature_category_id: 'f001-bhk-0001',
              feature_category_name: 'BHK',
              is_mandatory: true,
              is_filterable: true,
              sort_order: 1,
              is_active: true,
            },
            {
              feature_category_id: 'f002-facing-0002',
              feature_category_name: 'Facing',
              is_mandatory: false,
              is_filterable: true,
              sort_order: 2,
              is_active: true,
            },
            {
              feature_category_id: 'f003-amenities-0003',
              feature_category_name: 'Amenities',
              is_mandatory: false,
              is_filterable: true,
              sort_order: 3,
              is_active: true,
            },
            {
              feature_category_id: 'f004-furnishing-0004',
              feature_category_name: 'Furnishing Type',
              is_mandatory: false,
              is_filterable: false,
              sort_order: 4,
              is_active: true,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Applied mappings snapshot',
    type: PropertyMappingBatchResponseDto,
  })
  @Post('apply')
  applyMappings(@Body() dto: PropertyMappingBatchRequestDto): Promise<PropertyMappingBatchResponseDto> {
    return this.service.applyBatch(dto);
  }

  @ApiOperation({
    summary: 'Update property mappings (batch)',
    description: 'Idempotent update; behaves like apply but intended for updates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Updated mappings snapshot',
    type: PropertyMappingBatchResponseDto,
  })
  @Patch('apply')
  updateMappings(@Body() dto: PropertyMappingBatchRequestDto): Promise<PropertyMappingBatchResponseDto> {
    return this.service.applyBatch(dto);
  }
}
