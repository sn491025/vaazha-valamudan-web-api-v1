import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({
    description: 'Role unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Role name',
    example: 'ADMIN',
    enum: ['ADMIN', 'AGENT', 'BUYER', 'SELLER']
  })
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'System administrator with full access',
    required: false
  })
  description?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}
