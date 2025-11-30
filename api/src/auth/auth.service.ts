import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from 'src/user/dto/user.create.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/user/entities/user.entity';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.userService.findOneByEmailInternal(dto.email);

    const passwordMatching = bcrypt.compareSync(
      dto.password,
      user.hashedPassword,
    );
    if (!passwordMatching) {
      throw new BadRequestException(
        'Login failed, invalid credentials provided',
      );
    }

    return this.issueTokens(user);
  }

  async register(dto: UserCreateDto): Promise<TokenResponseDto> {
    const user = await this.userService.createInternal(dto);
    return this.issueTokens(user);
  }
  private async issueTokens(user: User) {
    const access_token = await this.jwtService.signAsync(
      { sub: user.id },
      {
        expiresIn: '15m',
      },
    );

    const refresh_token = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: '7d',
      },
    );

    const hashed = await bcrypt.hash(refresh_token, 10);
    await this.userService.update(user.id, { hashedRefreshToken: hashed });

    return { access_token, refresh_token };
  }

  async refreshTokens(refreshToken: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findOneInternal(payload.sub as number);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const valid = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');

    return this.issueTokens(user);
  }

  async logout(userId: number) {
    await this.userService.update(userId, { hashedRefreshToken: undefined });
    return { message: 'Logged out successfully' };
  }
}
