import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FeatureGroupsService } from './services/feature-groups.service';
import { CreateFeatureGroupDto } from './dto/create-feature-group.dto';
import { UpdateFeatureGroupDto } from './dto/update-feature-group.dto';
import { FeatureGroupResponseDto } from './dto/feature-group-response.dto';

@ApiTags('Feature Groups')
@Controller('master/feature-groups')
export class FeatureGroupsController {
  constructor(private readonly service: FeatureGroupsService) {}

  @ApiOperation({ summary: 'List feature groups', description: 'Returns feature groups, optionally only active.' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, example: true })
  @ApiResponse({
    status: 200,
    description: 'Array of feature groups',
    type: [FeatureGroupResponseDto],
    example: [
      {
        id: '99999999-8888-7777-6666-555555555555',
        name: 'Area Details',
        icon: 'home',
        sortOrder: 1,
        isActive: true,
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

  @ApiOperation({ summary: 'Get feature group by id' })
  @ApiResponse({ status: 200, type: FeatureGroupResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @ApiOperation({ summary: 'Create feature group' })
  @ApiResponse({ status: 201, type: FeatureGroupResponseDto })
  @Post()
  create(@Body() dto: CreateFeatureGroupDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Update feature group' })
  @ApiResponse({ status: 200, type: FeatureGroupResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFeatureGroupDto) {
    return this.service.update(id, dto);
  }

  @ApiOperation({ summary: 'Update feature group active status' })
  @ApiQuery({ name: 'isActive', required: true, type: Boolean, example: false })
  @ApiResponse({ status: 200, type: FeatureGroupResponseDto })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Query('isActive') isActive: string) {
    return this.service.updateStatus(id, isActive === 'true');
  }
}
