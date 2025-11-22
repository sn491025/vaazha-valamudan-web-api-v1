import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLeadStatusDto {
  @ApiProperty({ 
    description: 'Lead status',
    example: 'contacted'
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({ 
    description: 'Notes about the lead',
    example: 'Called and scheduled viewing for tomorrow'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'ID of user assigned to this lead',
    example: '11111111-1111-1111-1111-111111111111'
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @ApiPropertyOptional({ 
    description: 'Follow up date',
    example: '2024-02-01T10:00:00Z'
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  followUpDate?: Date;
}
