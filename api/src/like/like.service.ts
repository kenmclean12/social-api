import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
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
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(dto: LikeCreateDto): Promise<Like> {
    const { userId, messageId, postId, commentId } = dto;
    const user = await this.userService.findOneInternal(userId);

    let entity: { id: number } | null = null;
    let relationKey: EntityType | null = null;

    let recipientId: number;
    let notificationType: NotificationType;
    let contentId: number;
    switch (true) {
      case !!messageId: {
        const message = await this.messageService.findOne(messageId);
        recipientId = message.sender.id;
        contentId = messageId;
        notificationType = NotificationType.MESSAGE_LIKE;
        entity = message;
        relationKey = 'message';
        break;
      }
      case !!postId: {
        const post = await this.postService.findOne(postId);
        recipientId = post.creator.id;
        contentId = postId;
        notificationType = NotificationType.POST_LIKE;
        entity = post;
        relationKey = 'post';
        break;
      }
      case !!commentId: {
        const comment = await this.commentService.findOne(commentId);
        recipientId = comment.user.id;
        contentId = commentId;
        notificationType = NotificationType.COMMENT_LIKE;
        entity = comment;
        relationKey = 'comment';
        break;
      }
      default:
        throw new BadRequestException(
          'Must provide one of messageId, postId, commentId',
        );
    }

    const existingLike = await this.likeRepo.findOne({
      where: { user: { id: userId }, [relationKey]: { id: entity.id } },
    });

    if (existingLike) {
      throw new BadRequestException(`User already liked this ${relationKey}`);
    }

    const like: Partial<Like> = { user, [relationKey]: entity };
    const saved = await this.likeRepo.save(like);

    await this.notificationService.create({
      recipientId,
      actorId: userId,
      type: notificationType,
      [relationKey]: contentId,
    });

    return saved;
  }

  async delete(id: number, userId: number): Promise<Like> {
    const like = await this.likeRepo.findOne({
      where: { id },
      relations: ['user'],
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
