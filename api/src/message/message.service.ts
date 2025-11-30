import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { MessageCreateDto } from './dto/message-create.dto';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserService } from 'src/user/user.service';
import { MessageUpdateDto } from './dto/message-update.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
  ) {}

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['reads'],
    });

    if (!message) {
      throw new NotFoundException(
        `No message found with the provided ID: ${id}`,
      );
    }

    return message;
  }

  async findByConversationId(id: number): Promise<Message[]> {
    const message = await this.messageRepo.find({
      where: { id },
      relations: ['reads'],
    });

    if (!message) {
      throw new NotFoundException(
        `No messages found with the provided Conversation ID: ${id}`,
      );
    }

    return message;
  }

  async create({
    userId,
    conversationId,
    content,
  }: MessageCreateDto): Promise<Message> {
    await this.conversationService.findOneInternal(conversationId);
    const user = await this.userService.findOneInternal(userId);
    return await this.messageRepo.save({ sender: user, content });
  }

  async update(
    id: number,
    { userId, content }: MessageUpdateDto,
  ): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (message?.sender.id !== userId) {
      throw new UnauthorizedException(
        'Only the author of a message can update the content',
      );
    }

    return await this.messageRepo.save({ content });
  }

  async remove(id: number): Promise<Message> {
    const message = await this.findOne(id);
    return await this.messageRepo.remove(message);
  }
}
