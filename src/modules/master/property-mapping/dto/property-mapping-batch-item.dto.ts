import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class PropertyMappingBatchItemDto {
  @ApiProperty({ description: 'Feature category UUID', example: 'f001-bhk-0001' })
  @IsUUID()
  feature_category_id: string;

  @ApiProperty({ description: 'Feature category name (for UI echo)', example: 'BHK', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  feature_category_name: string;

  @ApiProperty({ description: 'Is feature mandatory for this property category', example: true })
  @IsBoolean()
  is_mandatory: boolean;

  @ApiProperty({ description: 'Is feature filterable for this property category', example: true })
  @IsBoolean()
  is_filterable: boolean;

  @ApiProperty({ description: 'Sort order for this feature', example: 1 })
  @IsInt()
  @Min(0)
  sort_order: number;

  @ApiProperty({ description: 'Mapping active status', example: true })
  @IsBoolean()
  is_active: boolean;
}
