import { ApiProperty } from '@nestjs/swagger';
import { InputType } from '../../../master/enums/InputType';

export class PropertyFeatureCategoryDto {
  @ApiProperty({
    example: '24ba4dab-0dd4-4ce1-ae2e-6676e9a86057',
    description: 'Unique identifier for the feature category'
  })
  id: string;

  @ApiProperty({
    example: 'Bedrooms',
    description: 'Name of the feature category'
  })
  name: string;

  @ApiProperty({
    example: 'numeric',
    enum: InputType,
    description: 'Type of input for this feature'
  })
  input_type: string;

  @ApiProperty({
    example: 'Number of bedrooms in the property',
    description: 'Description of the feature category',
    required: false
  })
  description?: string;

  @ApiProperty({
    example: 'bed',
    description: 'Icon for the feature category',
    required: false
  })
  icon?: string;

  @ApiProperty({
    example: 5,
    description: 'Sort order for display purposes'
  })
  sort_order: number;
}
