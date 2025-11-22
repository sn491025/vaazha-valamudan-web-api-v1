import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateFeatureOptionDto {
  @ApiProperty({ description: 'Option name', example: '3 BHK', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Technical value', example: '3BHK', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  value?: string;

  @ApiProperty({ description: 'Icon name', example: '2 BHK', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  icon: string;

  @ApiProperty({ description: 'Sort order', example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
