import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { FeatureOptionUpsertDto } from './feature-option-upsert.dto';

export class CreateFeatureCategoryWithOptionsDto {
  @ApiProperty({ description: 'Unique code', example: 'BHK', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: 'Display name', example: 'BHK Configuration', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Number of bedrooms, halls, and kitchens' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Input type',
    example: 'single_select',
    enum: ['single_select', 'multi_select', 'numeric', 'text'],
    default: 'single_select',
  })
  @IsEnum(['single_select', 'multi_select', 'numeric', 'text'])
  inputType: 'single_select' | 'multi_select' | 'numeric' | 'text';

  @ApiPropertyOptional({ description: 'Filterable in search', example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({ description: 'Mandatory when listing', example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Sort order', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Active status', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Options (only for single_select or multi_select)',
    type: [FeatureOptionUpsertDto],
    example: [
      { name: '1 BHK', value: '1BHK', sortOrder: 1, isActive: true },
      { name: '2 BHK', value: '2BHK', sortOrder: 2, isActive: true },
    ],
  })
  @ValidateIf((o) => ['single_select', 'multi_select'].includes(o.inputType))
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FeatureOptionUpsertDto)
  options?: FeatureOptionUpsertDto[];

  @ApiPropertyOptional({ description: 'Feature group UUID', example: '99999999-8888-7777-6666-555555555555' })
  @IsOptional()
  @IsUUID()
  featureGroupId?: string | null;
}
