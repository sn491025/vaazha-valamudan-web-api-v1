import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, Length, IsOptional } from 'class-validator';
import { DeviceInfoDto } from './device-info.dto';
import { NewUserInfoDto } from './register-user-info.dto';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  @ApiProperty({ 
    example: '+1234567890',
    description: 'User phone number'
  })
  phoneNumber: string;

  @IsString()
  @Length(4, 6, { message: 'OTP must be between 4 and 6 digits' })
  @Matches(/^\d+$/, { message: 'OTP must contain only numbers' })
  @ApiProperty({ 
    example: '123456',
    description: 'OTP code received via SMS'
  })
  otp: string;

  @IsOptional()
  @ApiProperty({
    type: DeviceInfoDto,
    required: false,
    description: 'Device information'
  })
  device?: DeviceInfoDto;

  @IsOptional()
  @ApiProperty({
    type: NewUserInfoDto,
    required: false,
    description: 'New user information (required if user does not exist)'
  })
  user?: NewUserInfoDto;
}
