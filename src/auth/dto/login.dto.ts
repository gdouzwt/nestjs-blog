import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: '管理员用户名' })
  username: string;

  @ApiProperty({ example: 'admin123', description: '管理员密码' })
  password: string;
}