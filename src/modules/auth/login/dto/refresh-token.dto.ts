import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { DeviceType } from '../../../shared';

export class RefreshTokenDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Device type', enum: DeviceType, required: false, default: DeviceType.WEB })
  @IsEnum(DeviceType)
  deviceType: DeviceType = DeviceType.WEB;
}
