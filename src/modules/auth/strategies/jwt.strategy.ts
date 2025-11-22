import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'CHANGE_ME'),
    });
  }

  async validate(payload: any) {
    // Only validate access tokens, not refresh tokens
    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Normalize to expose `id` consistently throughout the app
    return {
      id: payload.sub,
      sub: payload.sub,
      roles: payload.roles ?? [],
      dt: payload.dt,
      typ: payload.typ,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}