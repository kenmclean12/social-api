import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserCreateDto } from 'src/user/dto/user.create.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Authenticate a user to the application' })
  @Post('login')
  login(@Body() LoginDto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(LoginDto);
  }

  @ApiOperation({ summary: 'Register a user to the application' })
  @Post('register')
  async register(
    @Body() dto: UserCreateDto,
  ): Promise<{ access_token: string }> {
    return this.authService.register(dto);
  }
}
