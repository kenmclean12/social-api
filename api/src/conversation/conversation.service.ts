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
import {
  AlterParticipantsDto,
  AlterParticipantType,
} from './dto/add-participant.dto';
import { SafeConversationDto } from './dto/safe-conversation.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';

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
      relations: ['messages', 'initiator', 'participants'],
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
      relations: ['messages', 'initiator', 'participants'],
    });

    if (!conversation) {
      throw new NotFoundException(
        `No Conversation Found with Provided ID: ${id}`,
      );
    }

    return plainToInstance(SafeConversationDto, conversation, {
      excludeExtraneousValues: true,
    }) as SafeConversationDto;
  }

  async findByUserId(id: number): Promise<SafeConversationDto[]> {
    const initiatedConversations = await this.conversationRepo.find({
      where: { initiator: { id } },
      relations: ['messages', 'initiator', 'participants'],
    });

    const participatingConversations = await this.conversationRepo.find({
      where: { participants: { id } },
      relations: ['messages', 'initiator', 'participants'],
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
        {
          excludeExtraneousValues: true,
        },
      ) as SafeConversationDto;
      conversationSet.add(safeConversation);
    }

    return Array.from(conversationSet);
  }

  async create(dto: ConversationCreateDto): Promise<SafeConversationDto> {
    const initiatingUser = await this.userService.findOneInternal(
      dto.initiatorId,
    );
    const participants = await this.userService.findByIds(dto.recipientIds);

    const conversation = this.conversationRepo.create({
      name: dto.name,
      initiator: initiatingUser,
      participants,
    });

    const saved = await this.conversationRepo.save(conversation);
    const full = await this.conversationRepo.findOne({
      where: { id: saved.id },
      relations: ['messages', 'initiator', 'participants'],
    });

    const plain = instanceToPlain(full);
    return plainToInstance(SafeConversationDto, plain, {
      excludeExtraneousValues: true,
    }) as SafeConversationDto;
  }

  // async alterParticipants(
  //   id: number,
  //   dto: AlterParticipantsDto,
  // ): Promise<SafeConversationDto> {
  //   await this.userService.findOneInternal(dto.initiatorId);

  //   const existingConversation = await this.findOneInternal(id);
  //   if (existingConversation.initiator.id !== dto.initiatorId) {
  //     throw new UnauthorizedException(
  //       'Only the initiating user can modify participants.',
  //     );
  //   }

  //   const dtoUsers = await this.userService.findByIds(dto.recipientIds);

  //   let updatedParticipants: User[];
  //   if (dto.alterType === AlterParticipantType.ADD) {
  //     const existingIds = new Set(
  //       existingConversation.participants.map((p) => p.id),
  //     );
  //     updatedParticipants = [
  //       ...existingConversation.participants,
  //       ...dtoUsers.filter((u) => !existingIds.has(u.id)),
  //     ];
  //   } else {
  //     const idsToRemove = new Set(dtoUsers.map((u) => u.id));
  //     updatedParticipants = existingConversation.participants.filter(
  //       (p) => !idsToRemove.has(p.id),
  //     );
  //   }

  //   const updatedParticipantsArray = Array.from(updatedParticipants);
  //   const updatedConversation = this.conversationRepo.merge(
  //     existingConversation,
  //     { participants: updatedParticipantsArray },
  //   );

  //   const saved = await this.conversationRepo.save(updatedConversation);
  //   const full = await this.conversationRepo.findOne({
  //     where: { id: saved.id },
  //     relations: ['messages', 'initiator', 'participants'],
  //   });

  //   return plainToInstance(SafeConversationDto, full, {
  //     excludeExtraneousValues: true,
  //   }) as SafeConversationDto;
  // }

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

    const dtoUsers = await this.userService.findByIds(dto.recipientIds);

    if (dto.alterType === AlterParticipantType.ADD) {
      const existingIds = new Set(
        existingConversation.participants.map((p) => p.id),
      );
      const usersToAdd = dtoUsers.filter((u) => !existingIds.has(u.id));
      existingConversation.participants.push(...usersToAdd);
    } else {
      // REMOVE: only keep participants whose IDs are not in dtoUsers
      const idsToRemove = new Set(dtoUsers.map((u) => u.id));
      existingConversation.participants =
        existingConversation.participants.filter((p) => !idsToRemove.has(p.id));
    }

    const saved = await this.conversationRepo.save(existingConversation);
    const full = await this.conversationRepo.findOne({
      where: { id: saved.id },
      relations: ['messages', 'initiator', 'participants'],
    });

    return plainToInstance(SafeConversationDto, full, {
      excludeExtraneousValues: true,
    }) as SafeConversationDto;
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

    const saved = await this.conversationRepo.save(mergedData);
    const full = await this.conversationRepo.findOne({
      where: { id: saved.id },
      relations: ['messages', 'initiator', 'participants'],
    });

    const plain = instanceToPlain(full);
    return plainToInstance(SafeConversationDto, plain, {
      excludeExtraneousValues: true,
    }) as SafeConversationDto;
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

    return plainToInstance(SafeConversationDto, existingConversation, {
      excludeExtraneousValues: true,
    }) as SafeConversationDto;
  }
}
