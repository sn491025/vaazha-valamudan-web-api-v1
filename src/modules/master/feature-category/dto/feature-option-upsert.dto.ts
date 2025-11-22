import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class FeatureOptionUpsertDto {
  @ApiPropertyOptional({
    description: 'Existing option UUID for update; omit for new options',
    example: '323e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Option name', example: '2 BHK', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Technical value', example: '2BHK', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @ApiPropertyOptional({ description: 'Icon value', example: 'person', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 1, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Active status', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
