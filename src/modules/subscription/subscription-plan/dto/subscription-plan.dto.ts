import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PlanItemConfigDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  item_id: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isIncluded?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isConfigurable?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsNumber()
  @IsOptional()
  numericValue?: number;

  @ApiPropertyOptional({ example: 'HD Support' })
  @IsString()
  @IsOptional()
  textValue?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  durationDays?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isUnlimited?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isHighlighted?: boolean;

  @ApiPropertyOptional({ example: { color: 'gold' } })
  @IsOptional()
  customSettings?: any;
}

export class CreateSubscriptionPlanDto {
  @ApiProperty({ example: 'Gold Plan' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Best for professionals' })
  @IsString()
  @IsOptional()
  tagline?: string;

  @ApiProperty({ example: 1999.0 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  hasValueBasedPricing?: boolean;

  @ApiPropertyOptional({ example: [{ upTo: 5000000, price: 1499 }] })
  @IsOptional()
  valuePricingTiers?: any;

  @ApiProperty({ example: 30 })
  @IsNumber()
  durationDays: number;

  @ApiPropertyOptional({ example: 'monthly' })
  @IsString()
  @IsOptional()
  billingCycle?: string;

  @ApiPropertyOptional({ example: 'Agents and brokers' })
  @IsString()
  @IsOptional()
  targetAudience?: string;

  @ApiPropertyOptional({ example: 'Professional plan with premium features' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ type: [PlanItemConfigDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanItemConfigDto)
  planItems: PlanItemConfigDto[];
}

export class UpdateSubscriptionPlanDto extends CreateSubscriptionPlanDto {}
