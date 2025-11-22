import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PropertyCategoriesService } from './services/property-categories.service';
import { CreatePropertyCategoryDto } from './dto/create-property-category.dto';
import { UpdatePropertyCategoryDto } from './dto/update-property-category.dto';
import { PropertyCategoryResponseDto } from './dto/property-category-response.dto';

@ApiTags('Property Categories')
@Controller('master/property-categories')
export class PropertyCategoriesController {
  constructor(private readonly service: PropertyCategoriesService) {}

  @ApiOperation({ summary: 'List property categories', description: 'Returns property categories, optionally filtering only active ones.' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, example: true, description: 'If true, returns only active categories (default: true)' })
  @ApiResponse({
    status: 200,
    description: 'Array of property categories',
    type: [PropertyCategoryResponseDto],
    example: [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Apartment',
        description: 'Multi-unit residential building',
        icon: 'home',
        isActive: true,
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Villa',
        description: 'Independent house',
        icon: 'home',
        isActive: true,
        sortOrder: 2,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ],
  })
  @Get()
  list(@Query('activeOnly') activeOnly?: string) {
    const flag = activeOnly === undefined ? true : activeOnly === 'true';
    return this.service.findAll(flag);
  }

  @ApiOperation({ summary: 'Get property category by id' })
  @ApiResponse({ status: 200, description: 'Property category', type: PropertyCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Create property category' })
  @ApiResponse({
    status: 201,
    description: 'Created category',
    type: PropertyCategoryResponseDto,
    example: {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Plot',
      description: 'Land parcel',
      icon: 'home',
      isActive: true,
      sortOrder: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
  })
  @Post()
  create(@Body() dto: CreatePropertyCategoryDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update property category' })
  @ApiResponse({ status: 200, description: 'Updated category', type: PropertyCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePropertyCategoryDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Update property category active status' })
  @ApiQuery({ name: 'isActive', required: true, type: Boolean, example: false })
  @ApiResponse({ status: 200, description: 'Updated category', type: PropertyCategoryResponseDto })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Query('isActive') isActive: string) {
    return this.service.updateStatus(id, isActive === 'true');
  }
}
