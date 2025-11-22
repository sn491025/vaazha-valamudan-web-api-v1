import { ApiProperty } from '@nestjs/swagger';

export class PropertyMappingBatchResponseDto {
  @ApiProperty({ description: 'Property category UUID', example: 'a1b2c3d4-1111-2222-3333-444444444444' })
  property_category_id: string;

  @ApiProperty({ description: 'Property category name', example: 'Apartment' })
  property_category_name: string;

  @ApiProperty({
    description: 'Applied mappings snapshot',
    type: 'array',
    example: [
      {
        feature_category_id: 'f001-bhk-0001',
        feature_category_name: 'BHK',
        feature_group_id: '99999999-8888-7777-6666-555555555555',
        feature_group_name: 'Area Details',
        feature_group_sort_order: 1,
        is_mandatory: true,
        is_filterable: true,
        sort_order: 1,
        is_active: true,
      },
      {
        feature_category_id: 'f002-facing-0002',
        feature_category_name: 'Facing',
        feature_group_id: '99999999-8888-7777-6666-555555555555',
        feature_group_name: 'Area Details',
        feature_group_sort_order: 1,
        is_mandatory: false,
        is_filterable: true,
        sort_order: 2,
        is_active: true,
      },
    ],
  })
  mappings: Array<{
    feature_category_id: string;
    feature_category_name: string;
    feature_group_id: string | null;
    feature_group_name: string | null;
    feature_group_sort_order: number | null;
    is_mandatory: boolean;
    is_filterable: boolean;
    sort_order: number;
    is_active: boolean;
  }>;
}
