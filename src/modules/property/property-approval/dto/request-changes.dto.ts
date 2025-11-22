import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RequestChangesDto {
  @ApiProperty({ description: 'Required changes description', example: 'Add interior photos and update description.' })
  @IsString()
  required_changes: string;

  @ApiPropertyOptional({ description: 'Comments by reviewer', example: 'Pending evidence' })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiPropertyOptional({ description: 'Mark that changes are required', example: true })
  @IsBoolean()
  @IsOptional()
  requires_changes?: boolean = true;
}
