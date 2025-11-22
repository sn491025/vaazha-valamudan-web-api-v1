import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSubscriptionItemDto {
  @ApiProperty({ example: 'Property Listings' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'BASIC_FEATURE', enum: ['BASIC_FEATURE', 'ADDON_BOOSTER', 'ADDON_SERVICE'] })
  @IsString()
  type: string;

  @ApiProperty({ example: 'NUMERIC', enum: ['BOOLEAN', 'NUMERIC', 'TEXT', 'DAYS'] })
  @IsString()
  valueType: string;

  @ApiPropertyOptional({ example: 'Listings' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'listings' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ example: 'Number of property listings allowed' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  defaultValue?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isAddon?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: 'icon-list' })
  @IsString()
  @IsOptional()
  iconName?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateSubscriptionItemDto extends CreateSubscriptionItemDto {}
