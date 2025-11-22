import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType } from './create-saved-search.dto';

export class SavedSearchResponseDto {
  @ApiProperty({ 
    description: 'Unique identifier for the saved search',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
  })
  id: string;

  @ApiProperty({ 
    description: 'Type of entity being searched for',
    enum: EntityType,
    example: EntityType.PROPERTY,
    examples: {
      property: {
        value: EntityType.PROPERTY,
        description: 'Property search'
      },
      ad: {
        value: EntityType.AD,
        description: 'Advertisement search'
      }
    }
  })
  entity_type: EntityType;

  @ApiProperty({ 
    description: 'Search criteria used to match entities',
    example: {
      location: 'New York',
      min_price: 100000,
      max_price: 500000,
      property_type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['parking', 'gym', 'pool']
    }
  })
  search_criteria: Record<string, any>;

  @ApiPropertyOptional({ 
    description: 'User-defined name for the saved search',
    example: 'NYC 2BR Apartments Under 500K'
  })
  name?: string;

  @ApiProperty({ 
    description: 'Whether the search is currently active',
    example: true
  })
  is_active: boolean;

  @ApiProperty({ 
    description: 'Whether to send notifications for new matches',
    example: true
  })
  notify_on_new: boolean;

  @ApiProperty({ 
    description: 'ID of the user who owns this saved search',
    example: '12345678-90ab-cdef-1234-567890abcdef'
  })
  user_id: string;

  @ApiProperty({ 
    description: 'Number of entities currently matching this search',
    example: 23
  })
  match_count: number;

  @ApiProperty({ 
    description: 'Timestamp when the search was created',
    example: '2023-12-01T10:30:00.000Z'
  })
  created_at: Date;

  @ApiProperty({ 
    description: 'Timestamp when the search was last updated',
    example: '2023-12-01T15:45:00.000Z'
  })
  updated_at: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when notifications were last sent',
    example: '2023-12-01T08:00:00.000Z'
  })
  last_notification_sent?: Date;
}

export class SavedSearchStatsDto {
  @ApiProperty({
    description: 'Total number of saved searches',
    example: 5
  })
  total: number;

  @ApiProperty({
    description: 'Number of active saved searches',
    example: 4
  })
  active: number;

  @ApiProperty({
    description: 'Number of searches with notifications enabled',
    example: 3
  })
  with_notifications: number;

  @ApiProperty({
    description: 'Total matches across all saved searches',
    example: 127
  })
  total_matches: number;
}
