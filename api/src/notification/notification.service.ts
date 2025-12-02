import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
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
import { NotificationsGateway } from './notification.gateway';

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
    private readonly notificationsGateway: NotificationsGateway,
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
    });
  }

  async findAllForUser(userId: number): Promise<Notification[]> {
    return await this.notificationRepo.find({
      where: { recipient: { id: userId } },
      relations: ['actionUser', 'post', 'comment', 'message'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: NotificationCreateDto): Promise<Notification> {
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
        post = await this.postService.findOne(postId);
        break;
      }

      case NotificationType.COMMENT_LIKE:
      case NotificationType.COMMENT_REACTION: {
        if (!commentId) {
          throw new BadRequestException(
            'commentId is required for COMMENT notifications',
          );
        }
        comment = await this.commentService.findOne(commentId);
        break;
      }

      case NotificationType.MESSAGE:
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
    this.notificationsGateway.sendNotification(recipient.id, notification);
    return saved;
  }

  async markRead(
    id: number,
    dto: NotificationUpdateDto,
  ): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id } });

    if (!notification) {
      throw new BadRequestException(`Notification with ID ${id} not found`);
    }

    notification.read = dto.read;

    return await this.notificationRepo.save(notification);
  }

  async remove(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id },
      relations: ['recipient'],
    });

    if (!notification) {
      throw new BadRequestException(`Notification with ID ${id} not found`);
    }

    if (notification.recipient.id !== userId) {
      throw new UnauthorizedException(
        'Notifications can only be removed by the recipient',
      );
    }

    await this.notificationRepo.remove(notification);
    return notification;
  }
}
