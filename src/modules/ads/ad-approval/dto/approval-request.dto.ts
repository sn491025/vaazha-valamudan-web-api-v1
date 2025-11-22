import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class ApproveAdDto {
  @ApiProperty({ example: 'Ad meets all guidelines', required: false, description: 'Admin notes' })
  @IsOptional()
  @IsString()
  admin_notes?: string;
}

export class RejectAdDto {
  @ApiProperty({ example: 'Ad contains inappropriate content', description: 'Rejection reason' })
  @IsString()
  @MaxLength(1000)
  rejection_reason: string;

  @ApiProperty({ example: 'Please remove inappropriate images', required: false, description: 'Admin notes' })
  @IsOptional()
  @IsString()
  admin_notes?: string;
}

export class RequestChangesDto {
  @ApiProperty({ example: 'Please update the title and description', description: 'Changes requested' })
  @IsString()
  @MaxLength(1000)
  changes_requested: string;

  @ApiProperty({ example: 'Title needs to be more descriptive', required: false, description: 'Admin notes' })
  @IsOptional()
  @IsString()
  admin_notes?: string;
}

export class ApprovalResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ad_id: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false })
  reviewed_by_id?: string;

  @ApiProperty({ required: false })
  rejection_reason?: string;

  @ApiProperty({ required: false })
  admin_notes?: string;

  @ApiProperty({ required: false })
  changes_requested?: string;

  @ApiProperty({ required: false })
  reviewed_at?: Date;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
