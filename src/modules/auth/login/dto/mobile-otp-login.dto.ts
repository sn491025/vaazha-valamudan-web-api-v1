import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  Matches
} from 'class-validator';
import { OtpType } from '../../../shared';

const DEFAULT_OTP_TYPES: OtpType[] = [OtpType.WHATSAPP_OTP];

export class MobileOtpLoginDto {
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Please provide a valid phone number' })
  @ApiProperty({ 
    example: '+1234567890',
    description: 'User phone number'
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'OTP delivery channels',
    enum: OtpType,
    enumName: 'OtpType',
    isArray: true,
    example: DEFAULT_OTP_TYPES,
  })
  @IsArray({ message: 'otpTypes must be an array of OtpType values' })
  @ArrayNotEmpty({ message: 'otpTypes must contain at least one item' })
  @IsEnum(OtpType, { each: true, message: 'Each OTP type must be a valid OtpType value' })
  otpTypes: OtpType[] = DEFAULT_OTP_TYPES;
  
}
