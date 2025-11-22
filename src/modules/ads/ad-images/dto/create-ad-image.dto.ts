import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateAdImageDto {
  @ApiProperty({ example: 'uuid', description: 'Ad ID' })
  @IsUUID()
  ad_id: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Image URL' })
  @IsString()
  @MaxLength(500)
  url: string;

  @ApiProperty({ example: 'https://example.com/thumb.jpg', required: false, description: 'Thumbnail URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  thumbnail_url?: string;

  @ApiProperty({ example: 'image.jpg', required: false, description: 'Original filename' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  filename?: string;

  @ApiProperty({ example: 'image/jpeg', required: false, description: 'MIME type' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mime_type?: string;

  @ApiProperty({ example: 1024000, required: false, description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  file_size?: number;

  @ApiProperty({ example: 1920, required: false, description: 'Image width' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  width?: number;

  @ApiProperty({ example: 1080, required: false, description: 'Image height' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  height?: number;

  @ApiProperty({ example: 0, required: false, description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ example: false, required: false, description: 'Is primary image' })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @ApiProperty({ example: 'Product image', required: false, description: 'Alt text for accessibility' })
  @IsOptional()
  @IsString()
  alt_text?: string;
}

export class UpdateAdImageDto {
  @ApiProperty({ example: 0, required: false, description: 'Sort order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;

  @ApiProperty({ example: false, required: false, description: 'Is primary image' })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @ApiProperty({ example: 'Product image', required: false, description: 'Alt text for accessibility' })
  @IsOptional()
  @IsString()
  alt_text?: string;
}
