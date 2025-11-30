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
import { plainToInstance } from 'class-transformer';
import { MessageService } from 'src/message/message.service';
import {
  AlterParticipantsDto,
  AlterParticipantType,
  ConversationCreateDto,
  ConversationRemoveDto,
  ConversationUpdateDto,
  InitiateConversationDto,
  InitiateConversationResponseDto,
  SafeConversationDto,
} from './dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService,
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

  async findOne(id: number): Promise<SafeConversationDto> {
    const conversation = await this.findOneInternal(id);
    return this.toSafe(conversation);
  }

  async findByUserId(id: number): Promise<SafeConversationDto[]> {
    const conversations = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('conversation.initiator', 'initiator')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .where('initiator.id = :id', { id })
      .orWhere('participants.id = :id', { id })
      .distinct(true)
      .getMany();

    return conversations.map((c) => this.toSafe(c));
  }

  async create(dto: ConversationCreateDto): Promise<SafeConversationDto> {
    const initiator = await this.userService.findOneInternal(dto.initiatorId);
    const participants = await this.userService.findByIds(dto.recipientIds);

    const conversation = this.conversationRepo.create({
      name: dto.name,
      initiator,
      participants,
    });

    const saved = await this.conversationRepo.save(conversation);
    return this.toSafe(await this.findOneInternal(saved.id));
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
    dto: AlterParticipantsDto,
  ): Promise<SafeConversationDto> {
    await this.userService.findOneInternal(dto.initiatorId);
    const conversation = await this.findOneInternal(id);

    if (conversation.initiator.id !== dto.initiatorId)
      throw new UnauthorizedException(
        'Only the initiating user can modify participants.',
      );

    const users = await this.userService.findByIds(dto.recipientIds);

    if (dto.alterType === AlterParticipantType.ADD) {
      const existingIds = new Set(conversation.participants.map((p) => p.id));
      conversation.participants.push(
        ...users.filter((u) => !existingIds.has(u.id)),
      );
    } else {
      const removeIds = new Set(users.map((u) => u.id));
      conversation.participants = conversation.participants.filter(
        (p) => !removeIds.has(p.id),
      );
    }

    const saved = await this.conversationRepo.save(conversation);
    return this.toSafe(await this.findOneInternal(saved.id));
  }

  async update(
    id: number,
    dto: ConversationUpdateDto,
  ): Promise<SafeConversationDto> {
    const conversation = await this.findOneInternal(id);
    await this.userService.findOneInternal(dto.initiatorId);

    const merged = this.conversationRepo.merge(conversation, dto);
    const saved = await this.conversationRepo.save(merged);
    return this.toSafe(await this.findOneInternal(saved.id));
  }

  async remove({
    id,
    initiatorId,
  }: ConversationRemoveDto): Promise<SafeConversationDto> {
    const conversation = await this.findOneInternal(id);

    if (conversation.initiator.id !== initiatorId)
      throw new UnauthorizedException(
        'Only the initiating user can remove the conversation.',
      );

    await this.conversationRepo.remove(conversation);
    return this.toSafe(conversation);
  }

  private toSafe(conversation: Conversation): SafeConversationDto {
    return plainToInstance(SafeConversationDto, conversation, {
      excludeExtraneousValues: true,
    });
  }
}
