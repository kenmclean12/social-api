import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';

export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Message,
  ) {}
}
