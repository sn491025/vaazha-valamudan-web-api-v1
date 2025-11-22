import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ResolveReportDto {
  @ApiPropertyOptional({ description: 'Resolution notes', example: 'Verified and removed duplicate listing.' })
  @IsString()
  @IsOptional()
  resolution_notes?: string;

  @ApiPropertyOptional({ description: 'Resolution action', example: 'PROPERTY_UPDATED' })
  @IsString()
  @IsOptional()
  resolution_action?: string;
}
