import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { LoginDto, TokenResponseDto } from './dto';
import { UserCreateDto } from 'src/user/dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and return tokens' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: TokenResponseDto })
  login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and return tokens' })
  @ApiBody({ type: UserCreateDto })
  @ApiOkResponse({ type: TokenResponseDto })
  register(@Body() dto: UserCreateDto): Promise<TokenResponseDto> {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access & refresh tokens' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiOkResponse({ type: TokenResponseDto })
  refresh(@Body('refreshToken') token: string): Promise<TokenResponseDto> {
    return this.authService.refreshTokens(token);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user by clearing refresh token' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  logout(@Req() req: any) {
    return this.authService.logout(req.user.sub as number);
  }
}
