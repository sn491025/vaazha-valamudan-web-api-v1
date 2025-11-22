import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeatureOptionResponseDto } from './feature-option-response.dto';
import { InputType } from '../../enums/InputType';


export class FeatureCategoryResponseDto {
  @ApiProperty({ description: 'UUID', example: '223e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ description: 'Unique code', example: 'BHK' })
  code: string;

  @ApiProperty({ description: 'Name', example: 'BHK Configuration' })
  name: string;

  @ApiPropertyOptional({ description: 'Feature group UUID', example: '99999999-8888-7777-6666-555555555555', nullable: true })
  featureGroupId?: string | null;

  @ApiPropertyOptional({ description: 'Feature group name', example: 'Area Details', nullable: true })
  featureGroupName?: string | null;

  @ApiPropertyOptional({ description: 'Feature group sort order', example: 1, nullable: true })
  featureGroupSortOrder?: number | null;

  @ApiProperty({ description: 'Description', example: 'Number of bedrooms, halls, and kitchens', nullable: true })
  description?: string;

  @ApiProperty({ description: 'Input type', example: 'single_select', enum: InputType })
  inputType: InputType;

  @ApiProperty({ description: 'Filterable', example: true })
  isFilterable: boolean;

  @ApiProperty({ description: 'Mandatory', example: true })
  isMandatory: boolean;

  @ApiProperty({ description: 'Sort order', example: 1 })
  sortOrder: number;

  @ApiProperty({ description: 'Active status', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Created at', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Options for this feature category', type: [FeatureOptionResponseDto] })
  options: FeatureOptionResponseDto[];
}
