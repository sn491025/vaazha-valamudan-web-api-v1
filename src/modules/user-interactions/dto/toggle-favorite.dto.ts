import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum } from 'class-validator';
import { EntityType } from './create-saved-search.dto';

export class ToggleFavoriteDto {
  @ApiProperty({ 
    description: 'Entity type',
    enum: EntityType,
    example: EntityType.PROPERTY
  })
  @IsEnum(EntityType)
  entity_type: EntityType;

  @ApiProperty({ 
    description: 'Entity ID to toggle favorite status',
    example: '11111111-1111-1111-1111-111111111111'
  })
  @IsUUID()
  entity_id: string;
}
