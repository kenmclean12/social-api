import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Repository } from 'typeorm';
import { ConversationCreateDto } from './dto/conversation.create.dto';
import { ConversationUpdateDto } from './dto/conversation-update.dto';
import { ConversationRemoveDto } from './dto/conversation-remove.dto';
import { UserService } from 'src/user/user.service';
import { AlterParticipantsDto } from './dto/add-participant.dto';
import { User } from 'src/user/entities/user.entity';
import { SafeConversationDto } from './dto/safe-conversation.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly userService: UserService,
  ) {}

  async findOneInternal(id: number): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException(
        `No Conversation Found with Provided ID: ${id}`,
      );
    }

    return conversation;
  }

  async findOne(id: number): Promise<SafeConversationDto> {
    const conversation = await this.conversationRepo.findOne({
      where: { id },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException(
        `No Conversation Found with Provided ID: ${id}`,
      );
    }

    return plainToInstance(
      SafeConversationDto,
      conversation,
    ) as SafeConversationDto;
  }

  async findByUserId(id: number): Promise<SafeConversationDto[]> {
    const initiatedConversations = await this.conversationRepo.find({
      where: { initiator: { id } },
    });

    const participatingConversations = await this.conversationRepo.find({
      where: { participants: { id } },
    });

    const mergedConversations = [
      ...initiatedConversations,
      ...participatingConversations,
    ];

    const conversationSet = new Set<SafeConversationDto>();
    for (const conversation of mergedConversations) {
      const safeConversation = plainToInstance(
        SafeConversationDto,
        conversation,
      ) as SafeConversationDto;
      conversationSet.add(safeConversation);
    }

    return Array.from(conversationSet);
  }

  async create(dto: ConversationCreateDto): Promise<SafeConversationDto> {
    const initiatingUser = await this.userService.findOneInternal(
      dto.initiatorId,
    );
    const participants = await this.userService.findByIds(dto.recipentIds);

    const conversation = this.conversationRepo.create({
      name: dto.name,
      initiator: initiatingUser,
      participants,
    });

    const result = await this.conversationRepo.save(conversation);
    return plainToInstance(SafeConversationDto, result) as SafeConversationDto;
  }

  async alterParticipants(
    id: number,
    dto: AlterParticipantsDto,
  ): Promise<SafeConversationDto> {
    await this.userService.findOneInternal(dto.initiatorId);

    const existingConversation = await this.findOneInternal(id);
    if (existingConversation.initiator.id !== dto.initiatorId) {
      throw new UnauthorizedException(
        'Only the initiating user can modify participants.',
      );
    }

    const dtoUsers = await this.userService.findByIds(dto.recipentIds);
    const participantSet = new Set<User>(existingConversation.participants);

    for (const user of dtoUsers) {
      if (dto.alterType === 'add') {
        participantSet.add(user);
      } else {
        participantSet.delete(user);
      }
    }

    const updatedParticipantsArray = Array.from(participantSet);
    const updatedConversation = this.conversationRepo.merge(
      existingConversation,
      { participants: updatedParticipantsArray },
    );

    const savedResult = await this.conversationRepo.save(updatedConversation);
    return plainToInstance(
      SafeConversationDto,
      savedResult,
    ) as SafeConversationDto;
  }

  async update(
    id: number,
    dto: ConversationUpdateDto,
  ): Promise<SafeConversationDto> {
    const existingConversation = await this.findOneInternal(id);

    const mergedData = this.conversationRepo.merge(existingConversation, dto);
    if (!mergedData) {
      throw new Error(
        `Could not merge data during conversation update, Existing Entry: ${JSON.stringify(existingConversation)}`,
      );
    }

    const result = await this.conversationRepo.save(mergedData);
    return plainToInstance(SafeConversationDto, result) as SafeConversationDto;
  }

  async remove({
    id,
    initiatorId,
  }: ConversationRemoveDto): Promise<SafeConversationDto> {
    const existingConversation = await this.findOneInternal(id);

    if (existingConversation.initiator.id === initiatorId) {
      await this.conversationRepo.remove(existingConversation);
    } else {
      throw new UnauthorizedException(
        `Only the initiating User can remove the conversation from the database, Initiator ID: ${existingConversation.initiator.id}, Provided User ID: ${initiatorId}`,
      );
    }

    return plainToInstance(
      SafeConversationDto,
      existingConversation,
    ) as SafeConversationDto;
  }
}
