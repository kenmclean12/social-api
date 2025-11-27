/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, Logger } from '@nestjs/common';
import { UserCreateDto } from 'src/user/dto/user.create.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(private readonly userService: UserService) {
    this.logger = new Logger(this.constructor.name);
  }

  login() {
    this.logger.log('Login method called');
  }

  async register(dto: UserCreateDto) {
    try {
      await this.userService.create(dto);
    } catch (error) {
      this.logger.error(
        `User creation failed during registration process with provided data: ${dto}, error: ${error}`,
      );
      throw new Error(
        `User creation failed during registration process with provided data: ${dto}, error: ${error}`,
      );
    }

    return 1;
  }
}
