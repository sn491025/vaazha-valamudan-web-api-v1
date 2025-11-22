import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  Length
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'newuser@example.com',
    required: false
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890'
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP received on phone number',
    example: '123456'
  })
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only numbers' })
  otp: string;

  @ApiProperty({
    description: 'User password (optional; used mainly for admin accounts)',
    example: 'password123',
    minLength: 6,
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John'
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe'
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @ApiProperty({
    description: 'Referral code from existing user',
    example: 'ABC12345',
    required: false
  })
  @IsString()
  @IsOptional()
  @Length(6, 10, { message: 'Referral code must be between 6 and 10 characters' })
  referralCode?: string;
}
