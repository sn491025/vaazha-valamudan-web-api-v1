import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { DeviceType } from '../../shared/enums/device-type.enum';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwt: JwtService) {}

  private getAccessTtl(deviceType: string): number {
    return 86400;
  }

  private getRefreshTtl(deviceType: string): number {
    if (deviceType === DeviceType.MOBILE.toString()) {
      return 30 * 24 * 60 * 60; // 30 days in seconds
    }
    return 7 * 24 * 60 * 60; // 7 days in seconds
  }

  generateTokenPair(
    userId: string,
    roles: string[],
    deviceType: string = DeviceType.WEB.toString()
  ): { accessToken: string; refreshToken: string } {
    const basePayload = { sub: userId, roles, dt: deviceType };

    const accessToken = this.jwt.sign({ ...basePayload, typ: 'access' }, {
      expiresIn: this.getAccessTtl(deviceType)
    } as JwtSignOptions);

    const refreshToken = this.jwt.sign({ ...basePayload, typ: 'refresh' }, {
      expiresIn: this.getRefreshTtl(deviceType)
    } as JwtSignOptions);

    return { accessToken, refreshToken };
  }
}
