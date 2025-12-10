import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ConversationService } from 'src/conversation/conversation.service';
import { UserService } from 'src/user/user.service';
import { Message, MessageRead } from './entities';
import {
  MessageCreateDto,
  MessageReadResponseDto,
  MessageResponseDto,
  MessageUpdateDto,
} from './dto';
import { messageMapper } from './utils/message-mapper';
import { messageReadMapper } from './utils/message-read-mapper';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MessageRead)
    private readonly messageReadRepo: Repository<MessageRead>,
    @Inject(forwardRef(() => ConversationService))
    private readonly conversationService: ConversationService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async findOneInternal(id: number): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: this.getRelations(),
    });

    if (!message) {
      throw new NotFoundException(
        `No message found with the provided ID: ${id}`,
      );
    }

    return message;
  }

  async findMessageReadInternal(id: number): Promise<MessageRead> {
    const messageRead = await this.messageReadRepo.findOne({
      where: { id },
      relations: ['message', 'user'],
    });

    if (!messageRead) {
      throw new NotFoundException(
        `No message read entry found with the provided ID: ${id}`,
      );
    }

    return messageRead;
  }

  async findOne(id: number): Promise<MessageResponseDto> {
    const message = await this.findOneInternal(id);
    if (!message) {
      throw new NotFoundException(
        `No message found with the provided ID: ${id}`,
      );
    }

    return messageMapper(message);
  }

  async findByConversationId(id: number): Promise<MessageResponseDto[]> {
    const messages = await this.messageRepo.find({
      where: { conversation: { id } },
      relations: this.getRelations(),
      order: { createdAt: 'ASC' },
    });

    if (messages.length === 0) {
      throw new NotFoundException(
        `No messages found with the provided Conversation ID: ${id}`,
      );
    }

    return messages.map((m) => messageMapper(m));
  }

  async findUnreadMessageCountByConversationId(
    userId: number,
    conversationId: number,
  ): Promise<number> {
    return await this.messageRepo
      .createQueryBuilder('message')
      .leftJoin('message.reads', 'read', 'read.userId = :userId', { userId })
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('read.id IS NULL')
      .getCount();
  }

  async findUnreadMessageCountByUserId(userId: number): Promise<number> {
    const conversations =
      await this.conversationService.findByUserIdInternal(userId);

    let count = 0;
    for (const c of conversations) {
      const unreadCount = await this.findUnreadMessageCountByConversationId(
        userId,
        c.id,
      );

      count = count + unreadCount;
    }

    return count;
  }

  async create({
    senderId,
    conversationId,
    content,
  }: MessageCreateDto): Promise<MessageResponseDto> {
    await this.assertUserInConversation(senderId, conversationId);

    const user = await this.userService.findOneInternal(senderId);
    const conversation =
      await this.conversationService.findOneInternal(conversationId);

    if (conversation.closed) {
      throw new Error('This conversation has been closed');
    }

    const saved = await this.messageRepo.save({
      sender: user,
      conversation,
      content,
    });

    return await this.findOne(saved.id);
  }

  async markMessageRead(
    id: number,
    userId: number,
  ): Promise<MessageReadResponseDto> {
    const message = await this.findOneInternal(id);
    const user = await this.userService.findOneInternal(userId);
    const existingRead = await this.messageReadRepo.findOne({
      where: { message: { id: message.id }, user: { id: userId } },
    });

    if (existingRead) {
      throw new ConflictException(
        'A read entry already exists for this message/user id combination',
      );
    }

    const saved = await this.messageReadRepo.save({ message, user });
    const full = await this.findMessageReadInternal(saved.id);
    return messageReadMapper(full);
  }

  async update(
    id: number,
    userId: number,
    { content }: MessageUpdateDto,
  ): Promise<MessageResponseDto> {
    const message = await this.findOneInternal(id);

    if (message.conversation.closed) {
      throw new Error('This conversation has been closed');
    }

    if (message.sender.id !== userId) {
      throw new UnauthorizedException(
        'Only the author of a message can update the content',
      );
    }

    message.content = content;
    message.editedAt = new Date();

    await this.messageRepo.save(message);
    return await this.findOne(id);
  }

  async remove(id: number, userId: number): Promise<MessageResponseDto> {
    const message = await this.findOneInternal(id);
    await this.assertUserIsInitiator(userId, message.conversation.id);
    await this.messageRepo.remove(message);
    return messageMapper(message);
  }

  private async assertUserInConversation(
    userId: number,
    conversationId: number,
  ) {
    const conversation =
      await this.conversationService.findOneInternal(conversationId);

    const isInitiator = conversation.initiator?.id === userId;
    const isParticipant = conversation.participants?.some(
      (p) => p.id === userId,
    );

    if (!isInitiator && !isParticipant) {
      throw new UnauthorizedException(
        'You are not a participant in this conversation',
      );
    }

    return conversation;
  }

  private async assertUserIsInitiator(userId: number, conversationId: number) {
    const conversation =
      await this.conversationService.findOneInternal(conversationId);

    if (conversation.initiator?.id !== userId) {
      throw new UnauthorizedException(
        'Only the initiator of this conversation can perform this action',
      );
    }

    return conversation;
  }

  private getRelations() {
    return [
      'sender',
      'conversation',
      'reads',
      'reads.user',
      'reads.message',
      'likes',
      'likes.user',
      'likes.message',
      'likes.post',
      'likes.comment',
      'reactions',
      'reactions.user',
      'reactions.message',
      'reactions.post',
      'reactions.comment',
    ];
  }
}
