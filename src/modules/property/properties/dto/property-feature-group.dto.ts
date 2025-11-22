import { ApiProperty } from '@nestjs/swagger';

export class PropertyFeatureGroupDto {
  @ApiProperty({
    example: '68b2ad14-c237-4569-8365-3ba18e67b790',
    description: 'Unique identifier for the feature group'
  })
  id: string;

  @ApiProperty({
    example: 'Interior Features',
    description: 'Name of the feature group'
  })
  name: string;

  @ApiProperty({
    example: 10,
    description: 'Sort order for display purposes'
  })
  sort_order: number;

  @ApiProperty({
    example: 'Features inside the property',
    description: 'Description of the feature group',
    required: false
  })
  description?: string;
}




