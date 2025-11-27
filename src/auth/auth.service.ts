import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  login() {
    this.logger.log('Login method called');
  }

  register() {
    this.logger.log('Register method called');
  }
}
