import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateFeatureOptionDto {
  @ApiProperty({ description: 'Option name', example: '2 BHK', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Technical value', example: '2BHK', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @ApiProperty({ description: 'Icon name', example: '2 BHK', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  icon: string;

  @ApiProperty({ description: 'Sort order', example: 1, required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiProperty({ description: 'Active status', example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
