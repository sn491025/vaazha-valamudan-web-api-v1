import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMappingStatusDto {
  @ApiProperty({ description: 'Active status', example: false })
  @IsBoolean()
  isActive: boolean;
}
