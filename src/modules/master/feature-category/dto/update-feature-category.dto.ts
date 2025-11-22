import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { InputType } from '../../enums/InputType';

export class UpdateFeatureCategoryDto {
  @ApiProperty({ description: 'Display name', example: 'Facing Direction', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Feature group UUID', example: '99999999-8888-7777-6666-555555555555' })
  @IsOptional()
  @IsUUID()
  featureGroupId?: string;

  @ApiProperty({ description: 'Description', example: 'Direction the property faces', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Input type', example: 'single_select', enum: ['single_select', 'multi_select', 'numeric', 'text'], required: false })
  @IsOptional()
  @IsEnum(InputType)
  inputType?: InputType;

  @ApiProperty({ description: 'Filterable', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiProperty({ description: 'Mandatory', example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiProperty({ description: 'Sort order', example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
