import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FeatureOptionUpsertDto } from './feature-option-upsert.dto';

export class UpdateFeatureCategoryWithOptionsDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'BHK Configuration' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Feature group UUID', example: '99999999-8888-7777-6666-555555555555' })
  @IsOptional()
  @IsUUID()
  featureGroupId?: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Bedrooms, Halls, and Kitchens' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Input type',
    example: 'single_select',
    enum: ['single_select', 'multi_select', 'numeric', 'text'],
  })
  @IsOptional()
  @IsEnum(['single_select', 'multi_select', 'numeric', 'text'])
  inputType?: 'single_select' | 'multi_select' | 'numeric' | 'text';

  @ApiPropertyOptional({ description: 'Filterable in search', example: true })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({ description: 'Mandatory when listing', example: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Options (only for single_select or multi_select). Provide id to update an existing option; omit id to create a new one.',
    type: [FeatureOptionUpsertDto],
    example: [
      { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', name: '1 BHK', value: '1BHK', sortOrder: 1, isActive: true },
      { name: '4 BHK', value: '4BHK', sortOrder: 4, isActive: true },
    ],
  })
  @ValidateIf((o) => !o.inputType || ['single_select', 'multi_select'].includes(o.inputType))
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureOptionUpsertDto)
  options?: FeatureOptionUpsertDto[];
}
