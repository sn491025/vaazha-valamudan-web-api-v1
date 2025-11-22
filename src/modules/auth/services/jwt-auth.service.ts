import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DeviceType } from '../../shared/enums/device-type.enum';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwt: JwtService) {}

  private getAccessTtl(deviceType: string): string {
    // Force 1 day access token for all device types
    return '1d';
  }

  private getRefreshTtl(deviceType: string): string {
    if (deviceType === DeviceType.MOBILE.toString()) {
      return process.env.JWT_REFRESH_TTL_MOBILE || '30d';
    }
    return process.env.JWT_REFRESH_TTL_WEB || '7d';
  }

  generateTokenPair(
    userId: string,
    roles: string[],
    deviceType: string = DeviceType.WEB.toString()
  ): { accessToken: string; refreshToken: string } {
    const basePayload = { sub: userId, roles, dt: deviceType };

    const accessToken = this.jwt.sign(
      { ...basePayload, typ: 'access' },
      { expiresIn: this.getAccessTtl(deviceType) }
    );

    const refreshToken = this.jwt.sign(
      { ...basePayload, typ: 'refresh' },
      { expiresIn: this.getRefreshTtl(deviceType) }
    );

    return { accessToken, refreshToken };
  }
}
