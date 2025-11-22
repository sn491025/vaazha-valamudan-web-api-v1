import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  lastName: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890'
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'User referral code',
    example: 'ABC12345'
  })
  referralCode: string;

  @ApiProperty({
    description: 'Account status',
    example: true
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z'
  })
  createdAt: Date;
}