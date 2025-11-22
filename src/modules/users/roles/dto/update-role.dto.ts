import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'ADMIN',
    enum: ['ADMIN', 'AGENT', 'BUYER', 'SELLER'],
    required: false
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Role description',
    example: 'System administrator with full access',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}

