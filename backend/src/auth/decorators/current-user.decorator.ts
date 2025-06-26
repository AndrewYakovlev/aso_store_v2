import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentUserData {
  id: string;
  type: 'user' | 'anonymous';
  phone?: string;
}

interface RequestWithUser extends Request {
  user?: CurrentUserData;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData | null => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user || null;
  },
);
