import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class CreateMappingDto {
  @ApiProperty({ description: 'Property Category UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  propertyCategoryId: string;

  @ApiProperty({ description: 'Feature Category UUID', example: '223e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  featureCategoryId: string;

  @ApiProperty({ description: 'Active status for the mapping', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
