import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PublicTokenService {
  private readonly secret =
    process.env.PUBLIC_TOKEN_SECRET || 'CHANGE_ME';

  issue(payload: Record<string, any>, ttlSeconds = 900): string {
    const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
    const body = { ...payload, exp };
    const data = Buffer.from(JSON.stringify(body)).toString('base64url');
    const sig = crypto.createHmac('sha256', this.secret).update(data).digest('base64url');
    return `${data}.${sig}`;
  }

  verify(token: string): Record<string, any> {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', this.secret).update(data).digest('base64url');
    if (sig !== expected) {
      throw new Error('Invalid token');
    }
    const body = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (typeof body.exp === 'number' && body.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }
    return body;
  }
}
