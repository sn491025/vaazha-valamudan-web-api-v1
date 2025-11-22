import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { DeviceType } from '../../../shared';

export class UpgradeJwtDto {
  @ApiProperty({ description: 'User ID (UUID)' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Allowed roles to upgrade from token-based to JWT', required: false, type: [String], example: ['USER'] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  rolesAllowed?: string[];

  @ApiProperty({ description: 'Device type', enum: DeviceType, required: false, default: DeviceType.WEB })
  @IsEnum(DeviceType)
  @IsOptional()
  deviceType?: DeviceType = DeviceType.WEB;
}
