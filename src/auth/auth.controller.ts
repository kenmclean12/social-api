import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

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
  register() {
    return this.authService.register();
  }
}
