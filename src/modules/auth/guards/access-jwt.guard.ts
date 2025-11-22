import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessJwtGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info?: any): any {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    if (user.typ !== 'access') {
      throw new UnauthorizedException('Access token required');
    }
    return user;
  }
}
