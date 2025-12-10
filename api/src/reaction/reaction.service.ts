import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { PostService } from 'src/post/post.service';
import { CommentService } from 'src/comment/comment.service';
import { ReactionCreateDto, ReactionResponseDto } from './dto';
import { EntityType } from 'src/common/types';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { NotificationCreateDto } from 'src/notification/dto';
import { reactionMapper } from './utils/reaction-mapper';

@Injectable()
export class ReactionService {
  constructor(
    @InjectRepository(Reaction)
    private readonly reactionRepo: Repository<Reaction>,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly notificationService: NotificationService,
  ) {}

  async findOneInternal(id: number): Promise<Reaction> {
    const reaction = await this.reactionRepo.findOne({
      where: { id },
      relations: ['user', 'message', 'post', 'comment'],
      order: { createdAt: 'ASC' },
    });

    if (!reaction) {
      throw new NotFoundException(
        `No reaction found with the provided ID: ${id}`,
      );
    }

    return reaction;
  }

  async findReactionsForEntity(
    type: EntityType,
    id: number,
  ): Promise<ReactionResponseDto[]> {
    const relation = this.getRelationName(type);
    const reactions = await this.reactionRepo.find({
      where: { [relation]: { id } },
      relations: ['user', 'message', 'post', 'comment'],
      order: { createdAt: 'ASC' },
    });

    return reactions.map((r) => reactionMapper(r));
  }

  async create(dto: ReactionCreateDto): Promise<ReactionResponseDto> {
    const user = await this.userService.findOneInternal(dto.userId);
    const { entity, relationKey, recipientId, notificationType, contentId } =
      await this.resolveEntityAndNotification(dto);
    await this.removeExistingReaction(user.id, entity.id, relationKey);

    const saved = await this.reactionRepo.save({
      user,
      reaction: dto.reaction,
      [relationKey]: entity,
    });

    await this.sendNotification({
      actorId: user.id,
      recipientId: Number(recipientId),
      relationKey,
      notificationType,
      contentId,
    });

    return reactionMapper(await this.findOneInternal(saved.id));
  }

  async remove(id: number, userId: number): Promise<ReactionResponseDto> {
    const user = await this.userService.findOneInternal(userId);
    const reaction = await this.findOneInternal(id);

    if (reaction.user.id !== user.id) {
      throw new UnauthorizedException('You can only remove your own reactions');
    }

    await this.reactionRepo.remove(reaction);
    return reactionMapper(reaction);
  }

  private async resolveEntityAndNotification(dto: ReactionCreateDto) {
    if (dto.messageId) {
      const message = await this.messageService.findOne(dto.messageId);
      return {
        entity: message,
        relationKey: 'message' as EntityType,
        recipientId: message.sender?.id,
        notificationType: NotificationType.MESSAGE_REACTION,
        contentId: dto.messageId,
      };
    }

    if (dto.postId) {
      const post = await this.postService.findOneInternal(dto.postId);
      return {
        entity: post,
        relationKey: 'post' as EntityType,
        recipientId: post.creator.id,
        notificationType: NotificationType.POST_REACTION,
        contentId: dto.postId,
      };
    }

    if (dto.commentId) {
      const comment = await this.commentService.findOneInternal(dto.commentId);
      return {
        entity: comment,
        relationKey: 'comment' as EntityType,
        recipientId: comment.user.id,
        notificationType: NotificationType.COMMENT_REACTION,
        contentId: dto.commentId,
      };
    }

    throw new BadRequestException(
      'Must provide one of messageId, postId, commentId',
    );
  }

  private async removeExistingReaction(
    userId: number,
    entityId: number,
    relationKey: EntityType,
  ) {
    const existing = await this.reactionRepo.findOne({
      where: { user: { id: userId }, [relationKey]: { id: entityId } },
    });
    if (existing) await this.reactionRepo.remove(existing);
  }

  private async sendNotification(args: {
    actorId: number;
    recipientId: number;
    relationKey: EntityType;
    notificationType: NotificationType;
    contentId: number;
  }) {
    const { actorId, recipientId, relationKey, notificationType, contentId } =
      args;

    const payload: NotificationCreateDto = {
      actorId,
      recipientId,
      type: notificationType,
    };

    if (relationKey === 'post') payload.postId = contentId;
    if (relationKey === 'message') payload.messageId = contentId;
    if (relationKey === 'comment') payload.commentId = contentId;

    await this.notificationService.create(payload);
  }

  getRelationName(type: EntityType) {
    const relationMap = {
      message: 'message',
      post: 'post',
      comment: 'comment',
    } as const;

    const relation = relationMap[type];
    if (!relation) throw new BadRequestException('Invalid type');
    return relation;
  }
}
