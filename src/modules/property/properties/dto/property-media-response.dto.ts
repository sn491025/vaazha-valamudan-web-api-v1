// dtos/property-media-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class PropertyMediaResponseDto {
  @ApiProperty({
    example: '00729fb4-783c-46c4-934d-c3b874d07c40',
    description: 'Unique identifier for the media'
  })
  id: string;

  @ApiProperty({
    example: 'ece03889-0db5-48eb-99fa-e3f9164d656a',
    description: 'ID of the property this media belongs to'
  })
  property_id: string;

  @ApiProperty({
    example: 'IMAGE',
    description: 'Type of media (IMAGE, VIDEO, etc.)'
  })
  media_type: string;

  @ApiProperty({
    example: 'https://cdn.example.com/img1.jpg',
    description: 'URL to the media file'
  })
  url: string;

  @ApiProperty({
    example: null,
    description: 'URL to the thumbnail image for videos',
    nullable: true
  })
  thumbnail_url: string | null;

  @ApiProperty({
    example: null,
    description: 'Original filename of the uploaded file',
    nullable: true
  })
  original_filename: string | null;

  @ApiProperty({
    example: null,
    description: 'Storage key for the file',
    nullable: true
  })
  key: string | null;

  @ApiProperty({
    example: 'Main View',
    description: 'Title for the media',
    nullable: true
  })
  title: string | null;

  @ApiProperty({
    example: null,
    description: 'Description of the media',
    nullable: true
  })
  description: string | null;

  @ApiProperty({
    example: null,
    description: 'Alt text for accessibility',
    nullable: true
  })
  alt_text: string | null;

  @ApiProperty({
    example: true,
    description: 'Whether this is the primary media for the property'
  })
  is_primary: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this media has been approved'
  })
  is_approved: boolean;

  @ApiProperty({
    example: null,
    description: 'Category of the media (e.g., exterior, interior)',
    nullable: true
  })
  media_category: string | null;

  @ApiProperty({
    example: 0,
    description: 'Sort order for display purposes'
  })
  sort_order: number;

  @ApiProperty({
    example: null,
    description: 'Content type of the file',
    nullable: true
  })
  content_type: string | null;

  @ApiProperty({
    example: null,
    description: 'File size in bytes',
    nullable: true
  })
  file_size: number | null;

  @ApiProperty({
    example: null,
    description: 'Width of the image in pixels',
    nullable: true
  })
  width: number | null;

  @ApiProperty({
    example: null,
    description: 'Height of the image in pixels',
    nullable: true
  })
  height: number | null;

  @ApiProperty({
    example: null,
    description: 'Duration of the video in seconds',
    nullable: true
  })
  duration: number | null;

  @ApiProperty({
    example: '2025-10-28T16:21:43.102Z',
    description: 'When this media was created'
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-10-28T16:21:43.102Z',
    description: 'When this media was last updated'
  })
  updated_at: Date;
}