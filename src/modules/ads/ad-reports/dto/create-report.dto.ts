import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateAdReportDto {
  @ApiProperty({ description: 'Report type', example: 'FAKE_LISTING' })
  @IsString()
  report_type: string;

  @ApiProperty({ description: 'Report description', example: 'This ad appears to be a scam.' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Evidence payload (e.g., URLs)', example: { screenshots: ['https://.../1.png'] } })
  @IsOptional()
  evidence?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Report anonymously', example: false })
  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean;

  @ApiPropertyOptional({ description: 'Severity 1-5', example: 3 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  severity?: number = 1;

  @ApiPropertyOptional({ description: 'Explicit reporter id (admin only)', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @IsUUID()
  @IsOptional()
  reporter_id?: string;
}

export class ResolveAdReportDto {
  @ApiPropertyOptional({ description: 'Reviewer id (defaults to current user)', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @IsUUID()
  @IsOptional()
  reviewer_id?: string;

  @ApiPropertyOptional({ description: 'Resolution notes', example: 'Verified and removed duplicate listing.' })
  @IsString()
  @IsOptional()
  resolution_notes?: string;

  @ApiPropertyOptional({ description: 'Resolution action', example: 'AD_REMOVED' })
  @IsString()
  @IsOptional()
  resolution_action?: string;
}

export class DismissAdReportDto {
  @ApiPropertyOptional({ description: 'Reviewer id (defaults to current user)', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @IsUUID()
  @IsOptional()
  reviewer_id?: string;

  @ApiPropertyOptional({ description: 'Dismissal reason/notes', example: 'Insufficient evidence' })
  @IsString()
  @IsOptional()
  resolution_notes?: string;
}
