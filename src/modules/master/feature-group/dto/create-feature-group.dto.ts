import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFeatureGroupDto {
  @ApiProperty({ description: 'Feature group name', example: 'Area Details', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Optional emoji/icon for UI', example: '🏢', maxLength: 5 })
  @IsOptional()
  @IsString()
  @MaxLength(25)
  icon?: string;

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
