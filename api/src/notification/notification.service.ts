import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { UserService } from 'src/user/user.service';
import { PostService } from 'src/post/post.service';
import { CommentService } from 'src/comment/comment.service';
import { MessageService } from 'src/message/message.service';
import { NotificationCreateDto, NotificationUpdateDto } from './dto';
import { UserPost } from 'src/post/entities/user-post.entity';
import { Message } from 'src/message/entities';
import { Comment } from 'src/comment/entities/comment.entity';
import { SafeNotificationDto } from './dto/safe-notification.dto';
import { plainToInstance } from 'class-transformer';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => WebsocketGateway))
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async findOneInternal(
    recipientId: number,
    actionUserId: number,
    type: NotificationType,
  ): Promise<Notification | null> {
    return await this.notificationRepo.findOne({
      where: {
        recipient: { id: recipientId },
        actionUser: { id: actionUserId },
        type,
      },
      relations: ['actionUser', 'post', 'comment', 'message'],
    });
  }

  async findAllForUser(userId: number): Promise<SafeNotificationDto[]> {
    const notifications = await this.notificationRepo.find({
      where: { recipient: { id: userId } },
      relations: ['actionUser', 'post', 'comment', 'message'],
      order: { createdAt: 'DESC' },
    });

    const responseArray: SafeNotificationDto[] = [];
    for (const n of notifications) {
      const safeNotification = this.toSafeNotification(n);
      responseArray.push(safeNotification);
    }

    return responseArray;
  }

  async create(dto: NotificationCreateDto): Promise<SafeNotificationDto> {
    const { recipientId, actorId, type, postId, commentId, messageId } = dto;
    if (recipientId === actorId) {
      throw new BadRequestException('Cannot notify yourself');
    }

    const recipient = await this.userService.findOneInternal(recipientId);
    const actor = await this.userService.findOneInternal(actorId);

    let post: UserPost | undefined = undefined;
    let comment: Comment | undefined = undefined;
    let message: Message | undefined = undefined;

    switch (type) {
      case NotificationType.FOLLOW:
        break;

      case NotificationType.POST_LIKE:
      case NotificationType.POST_REACTION:
      case NotificationType.POST_COMMENT: {
        if (!postId) {
          throw new BadRequestException(
            'postId is required for POST notifications',
          );
        }
        post = await this.postService.findOneInternal(postId);
        break;
      }

      case NotificationType.COMMENT_LIKE:
      case NotificationType.COMMENT_REACTION: {
        if (!commentId) {
          throw new BadRequestException(
            'commentId is required for COMMENT notifications',
          );
        }
        comment = await this.commentService.findOneInternal(commentId);
        break;
      }

      case NotificationType.MESSAGE_LIKE:
      case NotificationType.MESSAGE_REACTION: {
        if (!messageId) {
          throw new BadRequestException(
            'messageId is required for MESSAGE notifications',
          );
        }
        message = await this.messageService.findOne(messageId);
        break;
      }

      default:
        throw new BadRequestException('Invalid notification type');
    }

    const notification: Partial<Notification> = {
      recipient,
      actionUser: actor,
      type,
      post,
      comment,
      message,
      read: false,
    };

    const saved = await this.notificationRepo.save(notification);
    if (!saved) {
      throw new Error(
        `Could not save updated notification with data: ${JSON.stringify(notification)}`,
      );
    }

    const safeNotification = this.toSafeNotification(saved);
    this.websocketGateway.sendNotification(recipient.id, safeNotification);
    return safeNotification;
  }

  async markRead(
    id: number,
    dto: NotificationUpdateDto,
  ): Promise<SafeNotificationDto> {
    const notification = await this.notificationRepo.findOne({ where: { id } });

    if (!notification) {
      throw new BadRequestException(`Notification with ID ${id} not found`);
    }

    notification.read = dto.read;

    const saved = await this.notificationRepo.save(notification);
    if (!saved) {
      throw new Error(
        `Could not save updated notification with data: ${JSON.stringify(notification)}`,
      );
    }

    return this.toSafeNotification(saved);
  }

  private toSafeNotification(entity: any): SafeNotificationDto {
    return plainToInstance(SafeNotificationDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
