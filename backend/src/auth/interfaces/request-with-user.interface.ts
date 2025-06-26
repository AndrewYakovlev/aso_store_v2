import { Request } from 'express';
import { UserRole } from '@prisma/client';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    sub?: string;
    type?: 'user' | 'anonymous';
    role?: UserRole;
    [key: string]: any;
  };
  anonymousUserId?: string;
}
