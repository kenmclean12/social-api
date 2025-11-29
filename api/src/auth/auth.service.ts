import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from 'src/user/dto/user.create.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login({
    email,
    password,
  }: LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByEmailInternal(email);

    const passwordMatching = bcrypt.compareSync(password, user.hashedPassword);
    if (!passwordMatching) {
      throw new BadRequestException(
        'Login failed, invalid credentials provided',
      );
    }

    const token = await this.signToken({
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    return { access_token: token };
  }

  async register(dto: UserCreateDto): Promise<{ access_token: string }> {
    const user = await this.userService.create(dto);
    const token = await this.signToken({
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.userName,
      email: user.email,
    });

    return { access_token: token };
  }

  private async signToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      audience: 'social-app',
      issuer: 'social-app',
    });
  }
}
