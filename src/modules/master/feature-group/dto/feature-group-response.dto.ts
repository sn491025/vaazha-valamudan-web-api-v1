import { ApiProperty } from '@nestjs/swagger';

export class FeatureGroupResponseDto {
  @ApiProperty({ description: 'UUID', example: '99999999-8888-7777-6666-555555555555' })
  id: string;

  @ApiProperty({ description: 'Name', example: 'Area Details' })
  name: string;

  @ApiProperty({ description: 'Emoji/Icon', example: 'home', nullable: true })
  icon?: string;

  @ApiProperty({ description: 'Sort order', example: 1 })
  sortOrder: number;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}
