import { ApiProperty } from '@nestjs/swagger';
import {  IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdatePropertyCategoryDto {
  @ApiProperty({ description: 'Property category name', example: 'Villa', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Description', example: 'Independent house', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'icon', example: 'house', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Sort order', example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
