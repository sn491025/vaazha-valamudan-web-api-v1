import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdsCategoryService } from './services/ads-category.service';
import { AdsCategoryResponseDto } from './dto/ads-category-response.dto';
import { CreateAdsCategoryDto } from './dto/create-ads-category.dto';
import { UpdateAdsCategoryDto } from './dto/update-ads-category.dto';

@ApiTags('Ads Category')
@Controller('master/ads-category')
export class AdsCategoryController {
  constructor(private readonly service: AdsCategoryService) {}

  @ApiOperation({
    summary: 'List Ads categories',
    description:
      'Returns ads categories, optionally filtering only active ones.'
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    example: true,
    description: 'If true, returns only active categories (default: true)'
  })
  @ApiResponse({
    status: 200,
    description: 'Array of ads categories',
    type: [AdsCategoryResponseDto],
    example: [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Paints',
        description: 'residential building paints',
        isActive: true,
        sortOrder: 1,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Maintainance',
        description: 'Maintainance of residential building',
        isActive: true,
        sortOrder: 2,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]
  })
  @Get()
  list(@Query('activeOnly') activeOnly?: string) {
    const flag = activeOnly === undefined ? true : activeOnly === 'true';
    return this.service.findAll(flag);
  }

  @ApiOperation({ summary: 'Get ads category by id' })
  @ApiResponse({
    status: 200,
    description: 'Property category',
    type: AdsCategoryResponseDto
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Create property category' })
  @ApiResponse({
    status: 201,
    description: 'Created category',
    type: AdsCategoryResponseDto,
    example: {
      name: 'Paints',
      description: 'Paints for residential building',
      isActive: true,
      sortOrder: 0
    }
  })
  @Post()
  create(@Body() dto: CreateAdsCategoryDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update ads category' })
  @ApiResponse({
    status: 200,
    description: 'Updated category',
    type: AdsCategoryResponseDto
  })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdsCategoryDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Update ads category active status' })
  @ApiQuery({ name: 'isActive', required: true, type: Boolean, example: false })
  @ApiResponse({
    status: 200,
    description: 'Updated category',
    type: AdsCategoryResponseDto
  })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Query('isActive') isActive: string) {
    return this.service.updateStatus(id, isActive === 'true');
  }
}