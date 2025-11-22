import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name',
    example: 'ADMIN',
    enum: ['ADMIN', 'AGENT', 'BUYER', 'SELLER']
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Role description',
    example: 'System administrator with full access',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;
}
