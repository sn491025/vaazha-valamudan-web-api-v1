import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType } from '../../saved-search/dto';

export class EnquiryResponseDto {
  @ApiProperty({ 
    description: 'Unique identifier for the enquiry',
    example: 'e12f4567-c89b-42d3-a456-426614174123'
  })
  id: string;

  @ApiProperty({ 
    description: 'Type of entity the enquiry is about',
    enum: EntityType,
    example: EntityType.PROPERTY,
    examples: {
      property: {
        value: EntityType.PROPERTY,
        description: 'Property viewing enquiry'
      },
      ad: {
        value: EntityType.AD,
        description: 'Advertisement enquiry'
      }
    }
  })
  entity_type: EntityType;

  @ApiProperty({ 
    description: 'Unique identifier of the enquired entity',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  entity_id: string;

  @ApiProperty({ 
    description: 'Full name of the person making the enquiry',
    example: 'John Smith'
  })
  name: string;

  @ApiProperty({ 
    description: 'Email address of the enquirer',
    example: 'john.smith@example.com'
  })
  email: string;

  @ApiPropertyOptional({ 
    description: 'Phone number of the enquirer',
    example: '+1-555-0123'
  })
  phone?: string;

  @ApiProperty({ 
    description: 'The enquiry message content',
    example: 'I am interested in viewing this 3BR apartment. Are weekends available for viewing?'
  })
  message: string;

  @ApiProperty({ 
    description: 'Current status of the enquiry',
    example: 'pending',
    enum: ['pending', 'responded', 'closed', 'spam']
  })
  status: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata and custom fields',
    example: {
      preferred_viewing_time: 'weekend',
      budget: '400000-500000',
      move_in_date: '2024-03-01',
      financing_pre_approved: true
    }
  })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'ID of the user who made the enquiry (if authenticated)',
    example: '98765432-1234-5678-9abc-def012345678'
  })
  user_id?: string;

  @ApiProperty({ 
    description: 'Timestamp when the enquiry was created',
    example: '2023-12-01T10:30:00.000Z'
  })
  created_at: Date;

  @ApiProperty({ 
    description: 'Timestamp when the enquiry was last updated',
    example: '2023-12-01T15:45:00.000Z'
  })
  updated_at: Date;
}

export class EnquiryStatusUpdateDto {
  @ApiProperty({
    description: 'New status for the enquiry',
    example: 'responded',
    enum: ['pending', 'responded', 'closed', 'spam']
  })
  status: string;
}

export class EnquiryStatsDto {
  @ApiProperty({
    description: 'Total number of enquiries',
    example: 125
  })
  total: number;

  @ApiProperty({
    description: 'Number of pending enquiries',
    example: 15
  })
  pending: number;

  @ApiProperty({
    description: 'Number of responded enquiries',
    example: 90
  })
  responded: number;

  @ApiProperty({
    description: 'Number of closed enquiries',
    example: 20
  })
  closed: number;
}
