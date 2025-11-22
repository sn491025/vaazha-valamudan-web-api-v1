import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { SavedSearchService } from './services/saved-search.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto, EntityType } from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('User Interactions - Saved Searches')
@Controller('user-interactions/saved-searches')
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
export class SavedSearchController {
  constructor(private readonly savedSearchService: SavedSearchService) {}

  @Get()
  @ApiOperation({ summary: 'Get all saved searches for current user' })
  @ApiQuery({ name: 'entity_type', required: false, enum: EntityType })
  async findAll(
    @Query('entity_type') entityType: EntityType,
    @Request() req: any,
  ) {
    return this.savedSearchService.findAllByUser(req.user.id, entityType);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new saved search' })
  @ApiBody({
    description: 'Saved search creation payload',
    type: CreateSavedSearchDto,
    examples: {
      propertySearch: {
        summary: 'Property search example',
        value: {
          entity_type: 'property',
          search_criteria: {
            location: 'New York',
            min_price: 100000,
            max_price: 500000,
            property_type: 'apartment',
            bedrooms: 2,
            bathrooms: 2,
            amenities: ['parking', 'gym', 'pool']
          },
          name: 'NYC 2BR Apartments Under 500K',
          notify_on_new: true
        }
      },
      adSearch: {
        summary: 'Ad search example',
        value: {
          entity_type: 'ad',
          search_criteria: {
            category: 'vehicles',
            location: 'California',
            min_price: 15000,
            max_price: 30000,
            make: 'Toyota',
            year: { min: 2018, max: 2023 },
            fuel_type: 'hybrid'
          },
          name: 'Toyota Hybrids 2018-2023',
          notify_on_new: false
        }
      }
    }
  })
  async create(
    @Body() createSavedSearchDto: CreateSavedSearchDto,
    @Request() req: any,
  ) {
    return this.savedSearchService.create(createSavedSearchDto, req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get saved search by ID' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.savedSearchService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a saved search' })
  @ApiParam({ 
    name: 'id', 
    description: 'Saved search ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    description: 'Saved search update payload',
    type: UpdateSavedSearchDto,
    examples: {
      updateCriteria: {
        summary: 'Update search criteria',
        value: {
          search_criteria: {
            location: 'New York',
            min_price: 150000,
            max_price: 600000,
            property_type: 'apartment',
            bedrooms: 3
          },
          name: 'NYC 3BR Apartments Updated Range'
        }
      },
      disableNotifications: {
        summary: 'Disable notifications',
        value: {
          notify_on_new: false,
          is_active: true
        }
      },
      deactivateSearch: {
        summary: 'Deactivate search',
        value: {
          is_active: false
        }
      }
    }
  })
  async update(
    @Param('id') id: string,
    @Body() updateSavedSearchDto: UpdateSavedSearchDto,
    @Request() req: any,
  ) {
    return this.savedSearchService.update(id, updateSavedSearchDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved search' })
  @ApiParam({ name: 'id', description: 'Saved search ID' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.savedSearchService.remove(id, req.user.id);
  }
}
