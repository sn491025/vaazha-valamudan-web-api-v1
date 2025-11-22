import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class NewUserInfoDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@example.com',
    required: false
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+919884562624'
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Referral code from existing user',
    example: 'ABC12345',
    required: false
  })
  @IsString()
  @Length(6, 10, { message: 'Referral code must be between 6 and 10 characters' })
  @IsOptional()
  referralCode?: string;
}
