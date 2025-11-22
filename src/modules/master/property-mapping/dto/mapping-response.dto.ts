import { ApiProperty } from '@nestjs/swagger';

export class MappingResponseDto {
  @ApiProperty({ description: 'UUID', example: '423e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Property Category UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  propertyCategoryId: string;

  @ApiProperty({ description: 'Feature Category UUID', example: '223e4567-e89b-12d3-a456-426614174000' })
  featureCategoryId: string;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
