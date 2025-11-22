import {
  Controller,
  Get,
  Post,
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
  ApiBody,
  ApiResponse
} from '@nestjs/swagger';
import { FavoriteService } from './services/favorite.service';
import { ToggleFavoriteDto, FavoriteResponseDto, CheckFavoriteResponseDto, ToggleFavoriteResponseDto } from './dto';
import { EntityType } from '../saved-search/dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('User Interactions - Favorites')
@Controller('user-interactions/favorites')
@ApiBearerAuth("JWT-auth")
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all favorites for current user',
    description: 'Retrieve all entities that the authenticated user has marked as favorites. Can be filtered by entity type.'
  })
  @ApiQuery({ 
    name: 'entity_type', 
    required: false, 
    enum: EntityType,
    description: 'Filter favorites by entity type',
    example: EntityType.PROPERTY
  })
  @ApiResponse({
    status: 200,
    description: 'List of user favorites retrieved successfully',
    type: [FavoriteResponseDto]
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  async findAll(
    @Query('entity_type') entityType: EntityType,
    @Request() req: any,
  ) {
    return this.favoriteService.findAllByUser(req.user.id, entityType);
  }

  @Post('toggle')
  @ApiOperation({ 
    summary: 'Toggle favorite status',
    description: 'Add or remove an entity from user favorites. If the entity is already favorited, it will be removed. If not favorited, it will be added.'
  })
  @ApiBody({
    description: 'Toggle favorite payload',
    type: ToggleFavoriteDto,
    examples: {
      favoriteProperty: {
        summary: 'Toggle property favorite',
        value: {
          entity_type: 'property',
          entity_id: '123e4567-e89b-12d3-a456-426614174000'
        }
      },
      favoriteAd: {
        summary: 'Toggle ad favorite', 
        value: {
          entity_type: 'ad',
          entity_id: '987f6543-a21b-45c6-d789-123456789abc'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status toggled successfully',
    type: ToggleFavoriteResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid entity type or ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 404, description: 'Not Found - Entity does not exist' })
  async toggleFavorite(@Body() toggleFavoriteDto: ToggleFavoriteDto, @Request() req: any) {
    return this.favoriteService.toggleFavorite(toggleFavoriteDto, req.user.id);
  }

  @Get('check/:entity_type/:entity_id')
  @ApiOperation({ 
    summary: 'Check if entity is favorited',
    description: 'Returns whether the current user has favorited the specified entity. Useful for UI state management.'
  })
  @ApiParam({ 
    name: 'entity_type', 
    enum: EntityType,
    description: 'Type of entity to check',
    example: 'property'
  })
  @ApiParam({ 
    name: 'entity_id', 
    description: 'Unique identifier of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite status retrieved successfully',
    type: CheckFavoriteResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid entity type or ID format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  async checkFavorite(
    @Param('entity_type') entityType: EntityType,
    @Param('entity_id') entityId: string,
    @Request() req: any,
  ) {
    const isFavorited = await this.favoriteService.isFavorited(
      req.user.id,
      entityType,
      entityId,
    );
    return { is_favorited: isFavorited };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Remove favorite by ID',
    description: 'Remove a specific favorite entry by its unique ID. User can only remove their own favorites.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Unique identifier of the favorite entry to remove',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite removed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Favorite removed successfully' },
        removed_id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing authentication token' })
  @ApiResponse({ status: 404, description: 'Not Found - Favorite does not exist or does not belong to user' })
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.favoriteService.removeFavoriteById(id, req.user.id);
  }
}
