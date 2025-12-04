import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { LikeCreateDto } from './dto';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { PostService } from 'src/post/post.service';
import { CommentService } from 'src/comment/comment.service';
import { EntityType } from 'src/common/types';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { NotificationCreateDto } from 'src/notification/dto';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepo: Repository<Like>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly notificationService: NotificationService,
  ) {}

  async findLikesForEntity(type: EntityType, id: number): Promise<Like[]> {
    const relation = getRelationName(type);
    return await this.likeRepo.find({
      where: { [relation]: { id } },
      relations: ['user', 'post', 'message', 'comment'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(dto: LikeCreateDto): Promise<Like> {
    const user = await this.userService.findOneInternal(dto.userId);

    const { entity, relationKey, recipientId, notificationType, contentId } =
      await this.resolveTarget(dto);

    await this.ensureNotAlreadyLiked(dto.userId, entity.id, relationKey);

    const saved = await this.likeRepo.save({
      user,
      [relationKey]: entity,
    });

    await this.createNotification({
      actorId: dto.userId,
      recipientId,
      notificationType,
      relationKey,
      contentId,
    });

    return this.findLikeWithRelationsOrFail(saved.id);
  }

  async delete(id: number, userId: number): Promise<Like> {
    const like = await this.likeRepo.findOne({
      where: { id },
      relations: ['user', 'message', 'post', 'comment'],
    });

    if (!like) {
      throw new BadRequestException(`Like with ID ${id} not found`);
    }

    if (like.user.id !== userId) {
      throw new UnauthorizedException(
        'Only the user who liked the content can remove the like',
      );
    }

    await this.likeRepo.remove(like);
    return like;
  }

  private async resolveTarget(dto: LikeCreateDto) {
    const { messageId, postId, commentId } = dto;

    if (messageId) {
      const message = await this.messageService.findOne(messageId);
      return {
        entity: message,
        relationKey: 'message' as EntityType,
        recipientId: message.sender.id,
        notificationType: NotificationType.MESSAGE_LIKE,
        contentId: messageId,
      };
    }

    if (postId) {
      const post = await this.postService.findOneInternal(postId);
      return {
        entity: post,
        relationKey: 'post' as EntityType,
        recipientId: post.creator.id,
        notificationType: NotificationType.POST_LIKE,
        contentId: postId,
      };
    }

    if (commentId) {
      const comment = await this.commentService.findOne(commentId);
      return {
        entity: comment,
        relationKey: 'comment' as EntityType,
        recipientId: comment.user.id,
        notificationType: NotificationType.COMMENT_LIKE,
        contentId: commentId,
      };
    }

    throw new BadRequestException(
      'Must provide one of messageId, postId, commentId',
    );
  }

  private async ensureNotAlreadyLiked(
    userId: number,
    entityId: number,
    relationKey: EntityType,
  ) {
    const existing = await this.likeRepo.findOne({
      where: { user: { id: userId }, [relationKey]: { id: entityId } },
    });

    if (existing) {
      throw new BadRequestException(`User already liked this ${relationKey}`);
    }
  }

  private async createNotification(args: {
    actorId: number;
    recipientId: number;
    notificationType: NotificationType;
    relationKey: EntityType;
    contentId: number;
  }) {
    const { actorId, recipientId, notificationType, relationKey, contentId } =
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

  private async findLikeWithRelationsOrFail(id: number) {
    const like = await this.likeRepo.findOne({
      where: { id },
      relations: ['user', 'post', 'message', 'comment'],
    });

    if (!like) {
      throw new NotFoundException(
        `Like with ID ${id} not found after creation`,
      );
    }

    return like;
  }
}

function getRelationName(type: EntityType) {
  const relationMap = {
    message: 'message',
    post: 'post',
    comment: 'comment',
  } as const;

  const relation = relationMap[type];
  if (!relation) {
    throw new BadRequestException('Invalid type');
  }

  return relation;
}
