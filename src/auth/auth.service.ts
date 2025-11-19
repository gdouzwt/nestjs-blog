import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    // 模拟验证用户名密码 (生产环境要查 User 表比对 bcrypt 哈希)
    if (user.username !== 'admin' || user.password !== 'admin123') {
      throw new UnauthorizedException('账号或密码错误');
    }
    
    // 签发 Token
    const payload = { username: user.username, sub: 1 };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}