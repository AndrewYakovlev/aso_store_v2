import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { AnonymousUserService } from '../services/anonymous-user.service';

@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy, 'anonymous') {
  constructor(private readonly anonymousUserService: AnonymousUserService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    const token = req.headers['x-anonymous-token'] as string;
    
    if (!token) {
      return null;
    }

    const user = await this.anonymousUserService.findByToken(token);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      type: 'anonymous',
    };
  }
}