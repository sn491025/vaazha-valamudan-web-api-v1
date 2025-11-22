import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { PublicTokenService } from '../services/public-token.service';

@Injectable()
export class PublicTokenStrategy extends PassportStrategy(Strategy, 'public-token') {
  constructor(private readonly publicTokens: PublicTokenService) {
    super();
  }

  async validate(req: any): Promise<any> {
    const token =
      (req.headers['x-public-token'] as string) ||
      (req.query && req.query.publicToken) ||
      null;

    if (!token) {
      throw new UnauthorizedException('Public token is required');
    }

    try {
      const payload = this.publicTokens.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired public token');
    }
  }
}
