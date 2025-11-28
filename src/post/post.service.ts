import { Logger } from '@nestjs/common';

export class PostService {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(this.constructor.name);
  }
}
