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
import { Message, MessageRead } from './entities';
import { MessageCreateDto, MessageUpdateDto } from './dto';
import { convertToResponseDto } from 'src/common/utils';
import { UserResponseDto } from 'src/user/dto';
import { LikeResponseDto } from 'src/like/dto';
import { ReactionResponseDto } from 'src/reaction/dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { MessageReadResponseDto } from './dto/message-read-response.dto';

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
      relations: [
        'sender',
        'reads',
        'reads.user',
        'likes',
        'likes.user',
        'reactions',
        'reactions.user',
      ],
    });

    if (!message) {
      throw new NotFoundException(
        `No message found with the provided ID: ${id}`,
      );
    }

    return message;
  }

  async findOne(id: number): Promise<MessageResponseDto> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: [
        'sender',
        'reads',
        'reads.user',
        'likes',
        'likes.user',
        'reactions',
        'reactions.user',
      ],
    });

    if (!message) {
      throw new NotFoundException(
        `No message found with the provided ID: ${id}`,
      );
    }

    return convertToResponseDto(MessageResponseDto, {
      ...message,
      sender: convertToResponseDto(UserResponseDto, message.sender),

      reads: message.reads?.map((read) =>
        convertToResponseDto(MessageReadResponseDto, read),
      ),

      likes: message.likes?.map((like) =>
        convertToResponseDto(LikeResponseDto, like),
      ),

      reactions: message.reactions?.map((reaction) =>
        convertToResponseDto(ReactionResponseDto, reaction),
      ),
    });
  }

  async findByConversationId(id: number): Promise<MessageResponseDto[]> {
    const messages = await this.messageRepo.find({
      where: { conversation: { id } },
      relations: [
        'sender',
        'reads',
        'reads.user',
        'likes',
        'likes.user',
        'reactions',
        'reactions.user',
      ],
      order: { createdAt: 'ASC' },
    });

    if (messages.length === 0) {
      throw new NotFoundException(
        `No messages found with the provided Conversation ID: ${id}`,
      );
    }

    return messages.map((message) =>
      convertToResponseDto(MessageResponseDto, {
        ...message,
        sender: convertToResponseDto(UserResponseDto, message.sender),
        reads: message.reads?.map((r) =>
          convertToResponseDto(MessageReadResponseDto, r),
        ),
        likes: message.likes?.map((l) =>
          convertToResponseDto(LikeResponseDto, l),
        ),
        reactions: message.reactions?.map((r) =>
          convertToResponseDto(ReactionResponseDto, r),
        ),
      }),
    );
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
    const message = await this.messageRepo.findOneBy({ id });
    if (!message) {
      throw new NotFoundException(`Message ID ${id} not found`);
    }

    const user = await this.userService.findOneInternal(userId);

    const saved = await this.messageReadRepo.save({ message, user });

    return convertToResponseDto(MessageReadResponseDto, saved);
  }

  async update(
    id: number,
    userId: number,
    { content }: MessageUpdateDto,
  ): Promise<MessageResponseDto> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException(`No Message found with ID: ${id}`);
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
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['conversation', 'sender'],
    });

    if (!message) {
      throw new NotFoundException(`Message ID ${id} not found`);
    }

    await this.assertUserIsInitiator(userId, message.conversation.id);

    await this.messageRepo.remove(message);

    return convertToResponseDto(MessageResponseDto, {
      ...message,
      sender: convertToResponseDto(UserResponseDto, message.sender),
      reads: [],
      likes: [],
      reactions: [],
    });
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
}
