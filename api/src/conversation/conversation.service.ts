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

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    private readonly userService: UserService,
  ) {}

  async findOne(id: number): Promise<Conversation> {
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

  async findByUserId(id: number): Promise<Conversation[]> {
    const initiatedConversations = await this.conversationRepo.find({
      where: { initiator: { id } },
    });

    const participatingConversations = await this.conversationRepo.find({
      where: { participants: { id } },
    });

    return [...initiatedConversations, ...participatingConversations];
  }

  async create(dto: ConversationCreateDto): Promise<Conversation> {
    const createdConversation = await this.conversationRepo.save(dto);

    const initiatingUser = await this.userService.findOne(dto.userId);
    const participants = await this.userService.findByIds(dto.recipentIds);
    if (!createdConversation) {
      throw new NotFoundException(
        `Could not create conversation with provided data: ${JSON.stringify(dto)}`,
      );
    }

    const result = { name: dto.name, initiatingUser, participants };
    return await this.conversationRepo.save(result);
  }

  //Create New Dto
  //Add Participant
  //Remove Participant

  async update(id: number, dto: ConversationUpdateDto): Promise<Conversation> {
    const existingConversation = await this.findOne(id);

    const mergedData = this.conversationRepo.merge(existingConversation, dto);
    if (!mergedData) {
      throw new Error(
        `Could not merge data during conversation update, Existing Entry: ${JSON.stringify(existingConversation)}`,
      );
    }

    return await this.conversationRepo.save(mergedData);
  }

  async remove({ id, userId }: ConversationRemoveDto): Promise<Conversation> {
    const existingConversation = await this.findOne(id);
    if (existingConversation.initiator.id === userId) {
      await this.conversationRepo.remove(existingConversation);
    } else {
      throw new UnauthorizedException(
        `Only the initiating User can remove the conversation from the database, Initiator ID: ${existingConversation.initiator.id}, Provided User ID: ${userId}`,
      );
    }

    return existingConversation;
  }
}
