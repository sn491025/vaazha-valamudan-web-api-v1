import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshJwtGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info?: any): any {
    console.log(user);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    if (user.typ !== 'refresh') {
      throw new UnauthorizedException('Refresh token required');
    }
    return user;
  }
}
