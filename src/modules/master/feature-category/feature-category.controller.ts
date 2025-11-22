import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeatureCategoriesService } from './services/feature-categories.service';
import { FeatureCategoryResponseDto } from './dto/feature-category-response.dto';
import { FeatureOptionResponseDto } from './dto/feature-option-response.dto';
import { CreateFeatureCategoryWithOptionsDto } from './dto/create-feature-category-with-options.dto';
import { UpdateFeatureCategoryWithOptionsDto } from './dto/update-feature-category-with-options.dto';

@ApiTags('Feature Categories')
@Controller('master/feature-categories')
export class FeatureCategoriesController {
  constructor(private readonly service: FeatureCategoriesService) {}

  @ApiOperation({ summary: 'List feature categories', description: 'Returns feature categories with options. Optionally filters to active items only.' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, example: true, description: 'If true, include only active categories and options (default: true)' })
  @ApiResponse({
    status: 200,
    description: 'Array of feature categories',
    type: [FeatureCategoryResponseDto],
    example: [
      {
        id: '223e4567-e89b-12d3-a456-426614174000',
        code: 'BHK',
        name: 'BHK Configuration',
        featureGroupId: '99999999-8888-7777-6666-555555555555',
        featureGroupName: 'Area Details',
        featureGroupSortOrder: 1,
        description: 'Number of bedrooms, halls, and kitchens',
        inputType: 'single_select',
        isFilterable: true,
        isMandatory: true,
        sortOrder: 1,
        isActive: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        options: [
          {
            id: '323e4567-e89b-12d3-a456-426614174000',
            name: '2 BHK',
            value: '2BHK',
            sortOrder: 1,
            isActive: true,
            featureCategoryId: '223e4567-e89b-12d3-a456-426614174000',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
      },
    ],
  })
  @Get()
  list(@Query('activeOnly') activeOnly?: string) {
    const flag = activeOnly === undefined ? true : activeOnly === 'true';
    return this.service.findAll(flag);
  }

  @ApiOperation({ summary: 'Get feature category by id' })
  @ApiResponse({ status: 200, type: FeatureCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Get(':id')
  get(@Param('id') id: string, @Query('activeOnly') activeOnly?: string) {
    const flag = activeOnly === undefined ? true : activeOnly === 'true';
    return this.service.findOne(id, flag);
  }



  @ApiOperation({ summary: 'Create feature category with options', description: 'Creates a feature category together with its options in a single request. Options are only allowed for single_select and multi_select input types.' })
  @ApiBody({
    type: CreateFeatureCategoryWithOptionsDto,
    examples: {
      createBHK: {
        summary: 'BHK category with options',
        value: {
          code: 'BHK',
          name: 'BHK Configuration',
          inputType: 'single_select',
          isFilterable: true,
          isMandatory: true,
          sortOrder: 1,
          options: [
            { name: '1 BHK', value: '1BHK', sortOrder: 1, isActive: true },
            { name: '2 BHK', value: '2BHK', sortOrder: 2, isActive: true },
            { name: '3 BHK', value: '3BHK', sortOrder: 3, isActive: true },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 201, type: FeatureCategoryResponseDto })
  @Post()
  createWithOptions(@Body() dto: CreateFeatureCategoryWithOptionsDto) {
    return this.service.createWithOptions(dto);
  }


  @ApiOperation({ summary: 'Update feature category with options', description: 'Updates a feature category and upserts its options in a single request. For select types: existing options with id are updated, new ones are created, and options omitted from the payload are deactivated.' })
  @ApiBody({
    type: UpdateFeatureCategoryWithOptionsDto,
    examples: {
      updateBHK: {
        summary: 'Adjust BHK options',
        value: {
          name: 'BHK',
          inputType: 'multi_select',
          options: [
            { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', name: '1 BHK', value: '1BHK', sortOrder: 1, isActive: true },
            { name: '4 BHK', value: '4BHK', sortOrder: 4, isActive: true },
          ],
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: FeatureCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Patch(':id/with-options')
  updateWithOptions(@Param('id') id: string, @Body() dto: UpdateFeatureCategoryWithOptionsDto) {
    return this.service.updateWithOptions(id, dto);
  }

  @ApiOperation({ summary: 'Update feature category active status' })
  @ApiQuery({ name: 'isActive', required: true, type: Boolean, example: false })
  @ApiResponse({ status: 200, type: FeatureCategoryResponseDto })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Query('isActive') isActive: string) {
    return this.service.updateStatus(id, isActive === 'true');
  }

  // Options (still available for fine-grained edits)

  @ApiOperation({ summary: 'List options for a feature category' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, example: true })
  @ApiResponse({ status: 200, type: [FeatureOptionResponseDto] })
  @Get(':id/options')
  listOptions(@Param('id') featureCategoryId: string, @Query('activeOnly') activeOnly?: string) {
    const flag = activeOnly === undefined ? true : activeOnly === 'true';
    return this.service.listOptions(featureCategoryId, flag);
  }
}
