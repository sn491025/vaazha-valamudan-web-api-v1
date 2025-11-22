import { ApiProperty } from '@nestjs/swagger';

export class PropertyCategoryResponseDto {
  @ApiProperty({ description: 'UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Name', example: 'Apartment' })
  name: string;

  @ApiProperty({ description: 'Description', example: 'Multi-unit residential building', nullable: true })
  description?: string;

  @ApiProperty({ description: 'icon', example: 'home', nullable: true })
  icon?: string;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order', example: 1 })
  sortOrder: number;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
