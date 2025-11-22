import { ApiProperty } from '@nestjs/swagger';

export class PropertyFeatureOptionDto {
  @ApiProperty({
    example: 'a5734ac1-2c2b-461b-ae1c-dbd3e49f26e6',
    description: 'Unique identifier for the feature option'
  })
  id: string;

  @ApiProperty({
    example: 'Furnished',
    description: 'Name of the feature option'
  })
  name: string;

  @ApiProperty({
    example: 'Property comes with furniture',
    description: 'Description of the feature option',
    required: false
  })
  description?: string;

  @ApiProperty({
    example: 'furniture',
    description: 'Icon for the feature option',
    required: false
  })
  icon?: string;

  @ApiProperty({
    example: 3,
    description: 'Sort order for display purposes'
  })
  sort_order: number;
}