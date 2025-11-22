import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class DismissReportDto {
  @ApiPropertyOptional({ description: 'Dismissal reason/notes', example: 'Insufficient evidence' })
  @IsString()
  @IsOptional()
  resolution_notes?: string;
}
