import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyMediaDto } from './property-media.dto';
import { UpdateMediaItemDto } from './update-media-item.dto';

export class UpdatePropertyMediaDto {
  @ApiPropertyOptional({ description: 'IDs of media to remove', example: ['a8b6d3fe-2b95-4b77-8a2a-2e1e20f0f0f0'] })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  removed?: string[];

  @ApiPropertyOptional({ description: 'New media to add', type: [PropertyMediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyMediaDto)
  @IsOptional()
  added?: PropertyMediaDto[];

  @ApiPropertyOptional({ description: 'Existing media to update', type: [UpdateMediaItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMediaItemDto)
  @IsOptional()
  updated?: UpdateMediaItemDto[];
}