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

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(MessageRead)
    private readonly messageReadRepo: Repository<MessageRead>,
    @Inject(forwardRef(() => ConversationService))
    private readonly conversationService: ConversationService,
    private readonly userService: UserService,
  ) {}

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['reads', 'likes', 'reactions'],
    });

    if (!message) {
      throw new NotFoundException(
        `No message found with the provided ID: ${id}`,
      );
    }

    return message;
  }

  async findByConversationId(id: number): Promise<Message[]> {
    const messages = await this.messageRepo.find({
      where: { conversation: { id } },
      relations: ['reads', 'likes', 'reactions'],
      order: { createdAt: 'ASC' },
    });

    if (messages.length === 0) {
      throw new NotFoundException(
        `No messages found with the provided Conversation ID: ${id}`,
      );
    }

    return messages;
  }

  async create({
    senderId,
    conversationId,
    content,
    // attachments,
  }: MessageCreateDto): Promise<Message> {
    await this.assertUserInConversation(senderId, conversationId);
    const user = await this.userService.findOneInternal(senderId);
    const conversation =
      await this.conversationService.findOneInternal(conversationId);

    // IMPLEMENT CONTENT SAVE
    // const newMessageData: Partial<Message> = {
    //   sender: user,
    //   conversation,
    //   content,
    // };

    // if (attachments) {
    //   newMessageData.attachments = attachments;
    // }

    return await this.messageRepo.save({ sender: user, conversation, content });
  }

  async markMessageRead(id: number, userId: number): Promise<MessageRead> {
    const message = await this.findOne(id);
    const user = await this.userService.findOneInternal(userId);
    return await this.messageReadRepo.save({ message, user });
  }

  async update(
    id: number,
    { senderId, content }: MessageUpdateDto,
  ): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException(
        `No Message found with the provided ID: ${id}`,
      );
    }

    if (message.sender.id !== senderId) {
      throw new UnauthorizedException(
        'Only the author of a message can update the content',
      );
    }

    message.content = content;
    message.editedAt = new Date();
    return await this.messageRepo.save(message);
  }

  async remove(id: number, userId: number): Promise<Message> {
    const message = await this.findOne(id);
    await this.assertUserIsInitiator(userId, message.conversation.id);
    return await this.messageRepo.remove(message);
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
