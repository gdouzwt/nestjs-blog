import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // 从 Header: Authorization Bearer xxx 取 Token
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY_123', // 必须和 Module 里一致
    });
  }

  async validate(payload: any) {
    // 验证通过后，Nest 会把返回值自动塞到 req.user 里
    return { userId: payload.sub, username: payload.username };
  }
}