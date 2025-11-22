import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class SubscribeUserDto {
  @ApiProperty({ example: 2 })
  @IsNumber()
  plan_id: number;

  @ApiProperty({ example: '2025-10-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-10-31T00:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({ example: 1999.0 })
  @IsNumber()
  @IsOptional()
  paidAmount?: number;

  @ApiPropertyOptional({ example: 'Paid' })
  @IsString()
  @IsOptional()
  paymentStatus?: string;

  @ApiPropertyOptional({ example: 'pay_abc123' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'NEW10' })
  @IsString()
  @IsOptional()
  promoCodeUsed?: string;
}

export class UpdateUserSubscriptionDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @ApiPropertyOptional({ example: 'canceled' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: '2025-11-30T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class PurchaseAddonDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  item_id: number;

  @ApiProperty({ example: 42 })
  @IsNumber()
  userSubscription_id: number;

  @ApiProperty({ example: '2025-10-05T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2025-10-12T00:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 499.0 })
  @IsNumber()
  paidAmount: number;

  @ApiProperty({ example: 'Paid' })
  @IsString()
  paymentStatus: string;

  @ApiPropertyOptional({ example: 'pay_xyz789' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'property_123' })
  @IsString()
  @IsOptional()
  appliedTo?: string;
}

export class RecordFeatureUsageDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  usageCount: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  usageValue: number;
}
