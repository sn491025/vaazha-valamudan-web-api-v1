import { ApiProperty } from '@nestjs/swagger';

export class FeatureOptionResponseDto {
  @ApiProperty({ description: 'UUID', example: '323e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Name', example: '2 BHK' })
  name: string;

  @ApiProperty({ description: 'Technical value', example: '2BHK', nullable: true })
  value?: string;

  @ApiProperty({ description: 'Icon name', example: '2 BHK', maxLength: 100, nullable: true })
  icon?: string;

  @ApiProperty({ description: 'Sort order', example: 1 })
  sortOrder: number;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Parent feature category UUID', example: '223e4567-e89b-12d3-a456-426614174000' })
  featureCategoryId: string;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
