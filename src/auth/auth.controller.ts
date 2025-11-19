import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto'; // 👈 1. 引入 DTO

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '管理员登录，获取 Token' })
  async login(@Body() loginDto: LoginDto) { // 偷懒用 any，正规要写 DTO 类
    return this.authService.login(loginDto);
  }
}