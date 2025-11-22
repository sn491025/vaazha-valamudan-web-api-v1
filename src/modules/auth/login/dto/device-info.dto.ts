import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeviceType } from '../../../shared';

export class DeviceInfoDto {
  @IsOptional()
  @IsEnum(DeviceType)
  @ApiProperty({
    enum: DeviceType,
    required: false,
    description: 'Device type (web or mobile)',
    example: DeviceType.WEB,
  })
  deviceType?: DeviceType;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Device identifier',
    example: 'ios:abcd-1234-efgh-5678',
  })
  deviceId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Client platform (e.g., ios, android, web)',
    example: 'ios',
  })
  platform?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Firebase FCM token used for push notifications',
    example: 'fcm:AAAA....',
  })
  firebaseToken?: string;
}
