import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from 'src/user/dto/user.create.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      this.logger.error(`Login failed, user with email ${email} not found`);
      throw new Error(`Login failed, user with email ${email} not found`);
    }

    const passwordMatching = bcrypt.compareSync(password, user.hashedPassword);
    if (!passwordMatching) {
      this.logger.error(`Login failed, invalid credentials provided`);
      throw new Error(`Login failed, invalid credentials provided`);
    }

    const token = await this.signToken({
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
    return { access_token: token };
  }

  async register(dto: UserCreateDto) {
    const user = await this.userService.create(dto);
    if (!user) {
      this.logger.error(`Registration failed for email ${dto.email}`);
      throw new Error(`Registration failed for email ${dto.email}`);
    }

    const token = await this.signToken({
      sub: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

    return { access_token: token };
  }

  private async signToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      audience: 'social-app',
      issuer: 'social-app',
    });
  }
}
