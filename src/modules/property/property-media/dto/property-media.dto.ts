import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class PropertyMediaDto {
  @ApiProperty({
    description: 'Media type',
    enum: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FLOOR_PLAN', 'VIRTUAL_TOUR', '3D_MODEL'],
    example: 'IMAGE',
  })
  @IsEnum(['IMAGE', 'VIDEO', 'DOCUMENT', 'FLOOR_PLAN', 'VIRTUAL_TOUR', '3D_MODEL'])
  media_type: string;

  @ApiProperty({ description: 'Media URL', example: 'https://cdn.example.com/property/123/main.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ description: 'Thumbnail URL for videos or documents', example: 'https://cdn.example.com/property/123/thumb.jpg' })
  @IsString()
  @IsOptional()
  thumbnail_url?: string;

  @ApiPropertyOptional({ description: 'Media title', example: 'Front view' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Media description', example: 'Main entrance and driveway' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether this is the primary media (main image)', example: true })
  @IsBoolean()
  @IsOptional()
  is_primary?: boolean;

  @ApiPropertyOptional({ description: 'Media category', example: 'EXTERIOR' })
  @IsString()
  @IsOptional()
  media_category?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  sort_order?: number;
}



