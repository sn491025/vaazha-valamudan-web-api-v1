import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { InputType } from '../../enums/InputType';

export class CreateFeatureCategoryDto {
  @ApiProperty({ description: 'Unique code', example: 'BHK', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Display name', example: 'BHK Configuration', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Feature group UUID', example: '99999999-8888-7777-6666-555555555555' })
  @IsOptional()
  @IsUUID()
  featureGroupId?: string;

  @ApiProperty({ description: 'Description', example: 'Number of bedrooms, halls, and kitchens', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Input type', example: 'single_select', enum: ['single_select', 'multi_select', 'numeric', 'text'], default: 'single_select' })
  @IsEnum(InputType)
  inputType: InputType;

  @ApiProperty({ description: 'Filterable in search', example: true, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiProperty({ description: 'Mandatory when listing', example: true, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

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
