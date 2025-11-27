import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserCreateDto } from 'src/user/dto/user.create.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Authenticate/Login to the application' })
  @Post('login')
  login() {
    return this.authService.login();
  }

  @ApiOperation({ summary: 'Register a user to the application' })
  @Post('register')
  async register(@Body() dto: UserCreateDto) {
    return this.authService.register(dto);
  }
}
