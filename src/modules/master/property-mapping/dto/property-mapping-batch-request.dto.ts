import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyMappingBatchItemDto } from './property-mapping-batch-item.dto';

export class PropertyMappingBatchRequestDto {
  @ApiProperty({ description: 'Property category UUID', example: 'a1b2c3d4-1111-2222-3333-444444444444' })
  @IsUUID()
  property_category_id: string;

  @ApiProperty({ description: 'Property category name (for UI echo)', example: 'Apartment', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  property_category_name: string;

  @ApiProperty({
    description: 'Mappings to apply',
    type: [PropertyMappingBatchItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PropertyMappingBatchItemDto)
  mappings: PropertyMappingBatchItemDto[];
}
