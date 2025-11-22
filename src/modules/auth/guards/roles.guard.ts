import {
  Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Guard to enforce roles declared via @Roles()
// Works together with an access-token guard (e.g., AccessJwtGuard) that populates request.user
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {
  }

  canActivate(context: ExecutionContext): boolean {
    // Read roles metadata (method-level overrides class-level)
    const requiredRoles = this.reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // If no roles specified, allow any authenticated user (use AccessJwtGuard for auth)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { sub: string; roles?: string[]; typ?: string } | undefined;

    if (!user) {
      throw new UnauthorizedException();
    }

    const userRoles = Array.isArray(user.roles) ? user.roles : [];

    // ANY-of semantics: allow if user has at least one required role
    const hasRequired = requiredRoles.some((r) => userRoles.includes(r));
    if (!hasRequired) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}