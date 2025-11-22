import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (user && !user.id && user.sub) {
      // Backward-compatible normalization if strategy didn't normalize
      return { ...user, id: user.sub };
    }
    return user;
  },
);
