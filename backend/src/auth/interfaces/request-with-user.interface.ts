import { Request } from 'express';

export interface RequestWithUser extends Request {
  user?: {
    id: string;
    sub?: string;
    type?: 'user' | 'anonymous';
    [key: string]: any;
  };
  anonymousUserId?: string;
}