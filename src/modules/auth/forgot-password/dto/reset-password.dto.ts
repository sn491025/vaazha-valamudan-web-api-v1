import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, Matches, Length } from 'class-validator';

export class ResetPasswordDto {
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
    description: 'New password',
    example: 'newPassword123',
    minLength: 6
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}
