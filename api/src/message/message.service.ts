import { InjectRepository } from '@nestjs/typeorm';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserService } from 'src/user/user.service';
import { Message } from './entities';
import { MessageCreateDto, MessageUpdateDto } from './dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @Inject(forwardRef(() => ConversationService))
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
      where: { conversation: { id } },
      relations: ['reads'],
      order: { createdAt: 'ASC' },
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
    const user = await this.userService.findOneInternal(userId);
    const conversation =
      await this.conversationService.findOneInternal(conversationId);

    return await this.messageRepo.save({ sender: user, conversation, content });
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

    message.content = content;
    message.editedAt = new Date();
    return await this.messageRepo.save(message);
  }

  async remove(id: number): Promise<Message> {
    const message = await this.findOne(id);
    return await this.messageRepo.remove(message);
  }
}
