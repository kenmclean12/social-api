import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Message,
  ) {}
}
