import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMediaItemDto {
  @ApiProperty({ description: 'Media ID', example: 'a8b6d3fe-2b95-4b77-8a2a-2e1e20f0f0f0' })
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ description: 'Media title', example: 'Updated title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Media description', example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is the primary media (main image)', example: false })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @ApiPropertyOptional({ description: 'Media category', example: 'INTERIOR' })
  @IsString()
  @IsOptional()
  media_category?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 2 })
  @IsNumber()
  @IsOptional()
  sort_order?: number;
}