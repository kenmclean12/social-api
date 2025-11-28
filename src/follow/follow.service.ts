import { Logger } from '@nestjs/common';
import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

export class FollowService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }
}
