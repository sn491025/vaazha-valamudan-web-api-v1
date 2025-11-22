import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApprovePropertyDto {
  @ApiPropertyOptional({ description: 'Comments by reviewer', example: 'Looks good' })
  @IsString()
  @IsOptional()
  comments?: string;
}
