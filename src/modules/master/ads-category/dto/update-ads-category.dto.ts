import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateAdsCategoryDto {
  @ApiProperty({
    description: 'Ads category name',
    example: 'Paints',
    required: false,
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    description: 'Description',
    example: 'Paints for residential properties',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Sort order', example: 2, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
