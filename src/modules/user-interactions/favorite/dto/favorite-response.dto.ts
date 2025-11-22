import { ApiProperty } from '@nestjs/swagger';
import { EntityType } from '../../saved-search/dto';

export class FavoriteResponseDto {
  @ApiProperty({ 
    description: 'Unique identifier for the favorite',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({ 
    description: 'Type of entity that was favorited',
    enum: EntityType,
    example: EntityType.PROPERTY,
    examples: {
      property: {
        value: EntityType.PROPERTY,
        description: 'Property listing favorite'
      },
      ad: {
        value: EntityType.AD,
        description: 'Advertisement favorite'
      }
    }
  })
  entity_type: EntityType;

  @ApiProperty({ 
    description: 'Unique identifier of the favorited entity',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  entity_id: string;

  @ApiProperty({ 
    description: 'Timestamp when the favorite was created',
    example: '2023-12-01T10:30:00.000Z'
  })
  created_at: Date;
}

export class CheckFavoriteResponseDto {
  @ApiProperty({
    description: 'Whether the entity is currently favorited by the user',
    example: true
  })
  is_favorited: boolean;
}

export class ToggleFavoriteResponseDto {
  @ApiProperty({
    description: 'Result of the toggle operation',
    example: 'added',
    enum: ['added', 'removed']
  })
  action: 'added' | 'removed';

  @ApiProperty({
    description: 'Message describing the result',
    example: 'Property has been added to favorites'
  })
  message: string;

  @ApiProperty({
    description: 'Updated favorite status',
    example: true
  })
  is_favorited: boolean;
}
