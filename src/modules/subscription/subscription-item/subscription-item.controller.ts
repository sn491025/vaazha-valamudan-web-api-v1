import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SubscriptionItemService } from './services/subscription-item.service';
import { CreateSubscriptionItemDto, UpdateSubscriptionItemDto } from './dto/subscription-item.dto';

@ApiTags('subscription-items')
@Controller('subscription-items')
export class SubscriptionItemController {
  constructor(private readonly service: SubscriptionItemService) {}

  @Get()
  @ApiOperation({ summary: 'Get all subscription items' })
  @ApiQuery({ name: 'type', required: false, example: 'BASIC_FEATURE' })
  @ApiQuery({ name: 'category', required: false, example: 'Listings' })
  @ApiQuery({ name: 'isActive', required: false, example: 'true' })
  @ApiQuery({ name: 'isAddon', required: false, example: 'false' })
  async list(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('isAddon') isAddon?: string,
  ) {
    return this.service.findAll({ type, category, isActive, isAddon });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscription item' })
  @ApiParam({ name: 'id', example: 1 })
  async get(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create subscription item' })
  @ApiBody({
    type: CreateSubscriptionItemDto,
    examples: {
      sample: {
        summary: 'Create video upload feature',
        value: {
          name: 'Video Upload',
          type: 'BASIC_FEATURE',
          valueType: 'BOOLEAN',
          category: 'Media',
          description: 'Ability to upload property videos',
          basePrice: 0,
          defaultValue: 0,
          unit: 'uploads',
          isPremium: true,
          isAddon: false,
        },
      },
    },
  })
  async create(@Body() dto: CreateSubscriptionItemDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update subscription item' })
  @ApiParam({ name: 'id', example: 1 })
  async update(@Param('id') id: string, @Body() dto: UpdateSubscriptionItemDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscription item' })
  @ApiParam({ name: 'id', example: 1 })
  async remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
