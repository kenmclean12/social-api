import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import {
  AlterParticipantsDto,
  AlterParticipantType,
  ConversationCreateDto,
  ConversationResponseDto,
  ConversationUpdateDto,
  InitiateConversationDto,
  InitiateConversationResponseDto,
} from './dto';
import { convertToResponseDto } from 'src/common/utils';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async findOneInternal(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('conversation.initiator', 'initiator')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .where('conversation.id = :id', { id })
      .getOne();

    if (!conversation)
      throw new NotFoundException(`No Conversation Found with ID: ${id}`);

    return conversation;
  }

  async findOne(id: number): Promise<ConversationResponseDto> {
    const conversation = await this.findOneInternal(id);
    return convertToResponseDto(ConversationResponseDto, conversation);
  }

  async findByUserId(id: number): Promise<ConversationResponseDto[]> {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.initiator', 'initiator')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .where('initiator.id = :id', { id })
      .orWhere('participants.id = :id', { id })
      .orderBy('messages.createdAt', 'DESC')
      .distinct(true)
      .getMany();

    return conversations.map((c) =>
      convertToResponseDto(ConversationResponseDto, c),
    );
  }

  async create(dto: ConversationCreateDto): Promise<ConversationResponseDto> {
    const initiator = await this.userService.findOneInternal(dto.initiatorId);
    const participants = await this.userService.findByIdsInternal(
      dto.recipientIds,
    );

    const conversation = this.conversationRepo.create({
      name: dto.name,
      initiator,
      participants,
    });

    const saved = await this.conversationRepo.save(conversation);
    return convertToResponseDto(
      ConversationResponseDto,
      await this.findOneInternal(saved.id),
    );
  }

  async initiateConversation(
    dto: InitiateConversationDto,
  ): Promise<InitiateConversationResponseDto> {
    const newConversation = await this.create(dto.conversation);
    const message = await this.messageService.create({
      ...dto.firstMessage,
      conversationId: newConversation.id,
    });

    return { conversation: newConversation, firstMessage: message };
  }

  async alterParticipants(
    id: number,
    userId: number,
    dto: AlterParticipantsDto,
  ): Promise<ConversationResponseDto> {
    await this.userService.findOneInternal(userId);
    const conversation = await this.findOneInternal(id);

    const isInitiator = conversation.initiator.id === userId;
    const isParticipant = conversation.participants.some(
      (p) => p.id === userId,
    );

    if (!isInitiator && !isParticipant) {
      throw new UnauthorizedException(
        'Only the initiator or participants can modify this conversation.',
      );
    }

    const users = await this.userService.findByIdsInternal(dto.recipientIds);

    if (dto.alterType === AlterParticipantType.ADD) {
      if (!isInitiator) {
        throw new UnauthorizedException(
          'Only the initiator can add participants.',
        );
      }
      const existingIds = new Set(conversation.participants.map((p) => p.id));
      conversation.participants.push(
        ...users.filter((u) => !existingIds.has(u.id)),
      );
    } else {
      if (isInitiator) {
        const removeIds = new Set(users.map((u) => u.id));
        conversation.participants = conversation.participants.filter(
          (p) => !removeIds.has(p.id),
        );
      } else {
        conversation.participants = conversation.participants.filter(
          (p) => p.id !== userId,
        );
      }
    }

    const saved = await this.conversationRepo.save(conversation);
    return convertToResponseDto(
      ConversationResponseDto,
      await this.findOneInternal(saved.id),
    );
  }

  async update(
    id: number,
    userId: number,
    dto: ConversationUpdateDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.findOneInternal(id);
    await this.userService.findOneInternal(userId);

    if (conversation.initiator.id !== userId) {
      throw new UnauthorizedException(
        'Only the initiator can alter the conversation',
      );
    }

    const merged = this.conversationRepo.merge(conversation, dto);
    const saved = await this.conversationRepo.save(merged);
    return convertToResponseDto(
      ConversationResponseDto,
      await this.findOneInternal(saved.id),
    );
  }

  async remove(id: number, userId: number): Promise<ConversationResponseDto> {
    const conversation = await this.findOneInternal(id);

    if (conversation.initiator.id !== userId)
      throw new UnauthorizedException(
        'Only the initiating user can remove the conversation.',
      );

    await this.conversationRepo.remove(conversation);
    return convertToResponseDto(ConversationResponseDto, conversation);
  }
}
