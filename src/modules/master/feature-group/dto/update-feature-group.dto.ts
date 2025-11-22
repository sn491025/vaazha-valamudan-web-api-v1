import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateFeatureGroupDto {
  @ApiPropertyOptional({ description: 'Feature group name', example: 'Building Info', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Optional emoji/icon for UI', example: '🏗️', maxLength: 5 })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  icon?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
