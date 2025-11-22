import { ApiProperty } from '@nestjs/swagger';
import { PropertyFeatureCategoryDto } from './property-feature-category.dto';
import { PropertyFeatureOptionDto } from './property-feature-option.dto';
import { PropertyFeatureGroupDto } from './property-feature-group.dto';

export class PropertyFeatureValueResponseDto {
  @ApiProperty({
    example: '5733e587-7839-40d8-b464-2b365b1ab2c3',
    description: 'Unique identifier for the feature value'
  })
  id: string;

  @ApiProperty({
    example: 'ece03889-0db5-48eb-99fa-e3f9164d656a',
    description: 'ID of the property this feature value belongs to'
  })
  property_id: string;

  @ApiProperty({
    example: 'ce12e973-02a9-4f7b-a4b0-b9166d39330c',
    description: 'ID of the feature group, if applicable',
    required: false,
    nullable: true
  })
  feature_group_id: string | null;

  @ApiProperty({
    example: '24ba4dab-0dd4-4ce1-ae2e-6676e9a86057',
    description: 'ID of the feature category'
  })
  feature_category_id: string;

  @ApiProperty({
    example: ['a5734ac1-2c2b-461b-ae1c-dbd3e49f26e6'],
    description: 'IDs of selected feature options for select input types',
    required: false,
    nullable: true,
    type: [String]
  })
  feature_option_ids: string[] | null;

  @ApiProperty({
    example: '3',
    description: 'Value for numeric, text, or boolean input types',
    required: false,
    nullable: true
  })
  values: any | null;

  @ApiProperty({
    example: 'sq.ft.',
    description: 'Unit for values when input type is units',
    required: false,
    nullable: true
  })
  units: string | null;

  @ApiProperty({
    example: false,
    description: 'Whether this feature value has been verified'
  })
  is_verified: boolean;

  @ApiProperty({
    example: '2025-10-28T13:51:12.229Z',
    description: 'When this feature value was created'
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-10-28T13:51:12.229Z',
    description: 'When this feature value was last updated'
  })
  updated_at: Date;

  // Enhanced properties
  @ApiProperty({
    type: PropertyFeatureGroupDto,
    description: 'Feature group details',
    required: false,
    nullable: true
  })
  feature_group?: PropertyFeatureGroupDto | null;

  @ApiProperty({
    type: PropertyFeatureCategoryDto,
    description: 'Feature category details',
    required: false,
    nullable: true
  })
  feature_category?: PropertyFeatureCategoryDto | null;

  @ApiProperty({
    type: [PropertyFeatureOptionDto],
    description: 'Feature option details for selected options',
    required: false
  })
  feature_options?: PropertyFeatureOptionDto[];

  @ApiProperty({
    example: 'Furnished',
    description: 'Human-readable display value',
    required: false,
    nullable: true
  })
  display_value?: string | null;
}