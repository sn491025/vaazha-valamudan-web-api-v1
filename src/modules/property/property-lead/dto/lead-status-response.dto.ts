import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadStatusResponseDto {
  @ApiProperty({ description: 'Lead status ID' })
  id: string;

  @ApiProperty({ description: 'Associated enquiry' })
  enquiry: any; // EnquiryResponseDto

  @ApiProperty({ description: 'Lead status' })
  status: string;

  @ApiPropertyOptional({ description: 'Status notes' })
  notes?: string;

  @ApiProperty({ description: 'Assigned user' })
  assignedTo: any; // UserResponseDto

  @ApiPropertyOptional({ description: 'Follow up date' })
  followUpDate?: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;
}
