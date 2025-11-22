import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  ValidateIf,
} from 'class-validator';
import { DeviceInfoDto } from './device-info.dto';

export class LoginRequestDto {
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
    required: false
  })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Please provide a valid phone number'
  })
  @ApiProperty({
    example: '+1234567890',
    description: 'User phone number',
    required: false
  })
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @ApiProperty({
    example: 'password123',
    description: 'User password'
  })
  password: string;

  @IsOptional()
  @ApiProperty({
    type: DeviceInfoDto,
    required: false,
    description: 'Device information'
  })
  device?: DeviceInfoDto;

  @ValidateIf((o) => !o.email && !o.phoneNumber)
  @IsNotEmpty({ message: 'Either email or phone number is required' })
  _emailOrPhone?: never;
}
