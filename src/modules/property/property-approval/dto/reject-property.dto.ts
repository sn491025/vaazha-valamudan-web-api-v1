import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectPropertyDto {
  @ApiProperty({ description: 'Rejection reason', example: 'Insufficient documentation' })
  @IsString()
  rejection_reason: string;

  @ApiPropertyOptional({ description: 'Comments by reviewer', example: 'Please provide ownership proof.' })
  @IsString()
  @IsOptional()
  comments?: string;
}
