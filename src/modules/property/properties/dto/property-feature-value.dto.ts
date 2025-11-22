import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

// Property Feature Value DTO
export class PropertyFeatureValueDto {
  @ApiProperty({ description: 'Feature category ID' })
  @IsUUID()
  feature_category_id: string;

  @ApiPropertyOptional({ description: 'Feature group ID' })
  @IsUUID()
  @IsOptional()
  feature_group_id?: string;

  @ApiPropertyOptional({
    description: 'Selected option ID (for single select features)'
  })
  @IsUUID()
  @IsOptional()
  option_id?: string;

  @ApiPropertyOptional({
    description: 'Selected option IDs (for multi-select features)'
  })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  option_ids?: string[];

  @ApiPropertyOptional({ description: 'Text value (for text features)' })
  @IsString()
  @IsOptional()
  value_text?: string;

  @ApiPropertyOptional({ description: 'Numeric value (for numeric features)' })
  @IsNumber()
  @IsOptional()
  value_number?: number;

  @ApiPropertyOptional({ description: 'Boolean value (for boolean features)' })
  @IsBoolean()
  @IsOptional()
  value_boolean?: boolean;
}
