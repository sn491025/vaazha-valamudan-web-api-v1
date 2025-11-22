import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePropertyCategoryDto {
  @ApiProperty({ description: 'Property category name', example: 'Apartment', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description', example: 'Multi-unit residential building', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'icon', example: 'house', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Sort order', example: 1, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ description: 'Active status', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
