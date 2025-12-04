import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { PostService } from 'src/post/post.service';
import { CommentService } from 'src/comment/comment.service';
import { ReactionCreateDto } from './dto';
import { EntityType } from 'src/common/types';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { NotificationCreateDto } from 'src/notification/dto';

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

  async findReactionsForEntity(
    type: EntityType,
    id: number,
  ): Promise<Reaction[]> {
    const relation = getRelationName(type);
    return await this.reactionRepo.find({
      where: { [relation]: { id } },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(dto: ReactionCreateDto): Promise<Reaction> {
    const { userId, messageId, postId, commentId, reaction } = dto;
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
        entity = message;
        notificationType = NotificationType.MESSAGE_REACTION;
        relationKey = 'message';

        const existingMessageReaction = await this.reactionRepo.findOne({
          where: { message: { id: messageId }, user: { id: userId } },
        });

        if (existingMessageReaction) {
          throw new BadRequestException(
            'You have already reacted to this message.',
          );
        }

        break;
      }

      case !!postId: {
        const post = await this.postService.findOneInternal(postId);
        recipientId = post.creator.id;
        contentId = postId;
        entity = post;
        notificationType = NotificationType.POST_REACTION;
        relationKey = 'post';

        const existingPostReaction = await this.reactionRepo.findOne({
          where: { post: { id: postId }, user: { id: userId } },
        });

        if (existingPostReaction) {
          throw new BadRequestException(
            'You have already reacted to this post.',
          );
        }

        break;
      }

      case !!commentId: {
        const comment = await this.commentService.findOne(commentId);
        recipientId = comment.user.id;
        contentId = commentId;
        entity = comment;
        notificationType = NotificationType.COMMENT_REACTION;
        relationKey = 'comment';

        const existingCommentReaction = await this.reactionRepo.findOne({
          where: { comment: { id: commentId }, user: { id: userId } },
        });

        if (existingCommentReaction) {
          throw new BadRequestException(
            'You have already reacted to this comment.',
          );
        }

        break;
      }

      default:
        throw new BadRequestException(
          'Must provide one of messageId, postId, commentId',
        );
    }

    const reactionEntity: Partial<Reaction> = {
      user,
      reaction,
      [relationKey]: entity,
    };

    const saved = await this.reactionRepo.save(reactionEntity);

    const notificationPayload: NotificationCreateDto = {
      recipientId,
      actorId: userId,
      type: notificationType,
    };

    switch (relationKey) {
      case 'post':
        notificationPayload.postId = contentId;
        break;
      case 'message':
        notificationPayload.messageId = contentId;
        break;
      case 'comment':
        notificationPayload.commentId = contentId;
        break;
    }

    await this.notificationService.create(notificationPayload);

    return saved;
  }

  async remove(id: number, userId: number): Promise<Reaction> {
    const reaction = await this.reactionRepo.findOne({
      where: { id },
      relations: ['user', 'message', 'post', 'comment'],
    });

    if (!reaction) {
      throw new BadRequestException(`Reaction with ID ${id} not found`);
    }

    if (reaction.user.id !== userId) {
      throw new UnauthorizedException(
        'Reactions can only be removed by the user that created it',
      );
    }

    await this.reactionRepo.remove(reaction);
    return reaction;
  }
}

function getRelationName(type: EntityType) {
  const relationMap = {
    message: 'message',
    post: 'post',
    comment: 'comment',
  } as const;

  const relation = relationMap[type];
  if (!relation) throw new BadRequestException('Invalid type');
  return relation;
}
