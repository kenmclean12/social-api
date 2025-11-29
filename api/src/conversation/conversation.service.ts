import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
  ) {}

  async findOne(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({ where: { id } });
    if (!conversation) {
      throw new NotFoundException(
        `No Conversation Found with Provided ID: ${id}`,
      );
    }

    return conversation;
  }
}
