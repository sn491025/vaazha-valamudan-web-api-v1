import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsEmail, IsOptional, IsEnum, IsObject } from 'class-validator';
import { EntityType } from '../../saved-search/dto';

export class CreateEnquiryDto {
  @ApiProperty({ 
    description: 'Entity type',
    enum: EntityType,
    example: EntityType.PROPERTY
  })
  @IsEnum(EntityType)
  entity_type: EntityType;

  @ApiProperty({ 
    description: 'Entity ID to enquire about',
    example: '11111111-1111-1111-1111-111111111111'
  })
  @IsUUID()
  entity_id: string;

  @ApiProperty({ 
    description: 'Enquirer full name',
    example: 'John Smith'
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'Enquirer email address',
    example: 'john.smith@example.com'
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ 
    description: 'Enquirer phone number',
    example: '+1-555-0123'
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ 
    description: 'Enquiry message',
    example: 'I am interested in viewing this property. Please contact me to schedule a visit.'
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({ 
    description: 'Additional metadata',
    example: { 'preferred_viewing_time': 'evening', 'budget': '100000-150000' }
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
