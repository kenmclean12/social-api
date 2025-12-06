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
import {
  NotificationCreateDto,
  NotificationResponseDto,
  NotificationUpdateDto,
} from './dto';
import { UserPost } from 'src/post/entities/user-post.entity';
import { Message } from 'src/message/entities';
import { Comment } from 'src/comment/entities/comment.entity';
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { convertToResponseDto } from 'src/common/utils';
import { UserResponseDto } from 'src/user/dto';
import { PostResponseDto } from 'src/post/dto';
import { CommentResponseDto } from 'src/comment/dto';
import { MessageResponseDto } from 'src/message/dto';

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

  private mapNotificationToDto(n: Notification): NotificationResponseDto {
    const dto = convertToResponseDto(NotificationResponseDto, {
      ...n,

      recipient: n.recipient
        ? convertToResponseDto(UserResponseDto, n.recipient)
        : undefined,

      actionUser: n.actionUser
        ? convertToResponseDto(UserResponseDto, n.actionUser)
        : undefined,

      post: n.post
        ? convertToResponseDto(PostResponseDto, {
            ...n.post,
            creatorId: n.post.creator?.id,
          })
        : undefined,

      comment: n.comment
        ? convertToResponseDto(CommentResponseDto, {
            ...n.comment,
            user: n.comment.user
              ? convertToResponseDto(UserResponseDto, n.comment.user)
              : undefined,
            postId: n.comment.post?.id,
          })
        : undefined,

      message: n.message
        ? convertToResponseDto(MessageResponseDto, {
            ...n.message,
            sender: n.message.sender
              ? convertToResponseDto(UserResponseDto, n.message.sender)
              : undefined,
            conversationId: n.message.conversation?.id,
          })
        : undefined,
    });

    dto.notificationMessage = this.buildNotificationMessage(
      n.type,
      n.actionUser,
    );

    return dto;
  }

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

  async findAllForUser(userId: number): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepo.find({
      where: { recipient: { id: userId } },
      relations: [
        'actionUser',
        'recipient',
        'post',
        'post.creator',
        'comment',
        'comment.user',
        'message',
        'message.sender',
        'message.reads',
        'message.conversation',
      ],
      order: { createdAt: 'DESC' },
    });

    return notifications.map((n) => this.mapNotificationToDto(n));
  }

  async create(dto: NotificationCreateDto): Promise<NotificationResponseDto> {
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
      case NotificationType.POST_COMMENT:
        if (!postId) throw new BadRequestException('postId is required');
        post = await this.postService.findOneInternal(postId);
        break;

      case NotificationType.COMMENT_LIKE:
      case NotificationType.COMMENT_REACTION:
        if (!commentId) throw new BadRequestException('commentId is required');
        comment = await this.commentService.findOneInternal(commentId);
        break;

      case NotificationType.MESSAGE_LIKE:
      case NotificationType.MESSAGE_REACTION:
        if (!messageId) throw new BadRequestException('messageId is required');
        message = await this.messageService.findOneInternal(messageId);
        break;

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
    const dtoOut = this.mapNotificationToDto(saved);

    this.websocketGateway.sendNotification(recipient.id, dtoOut);
    return dtoOut;
  }

  async markRead(
    id: number,
    dto: NotificationUpdateDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepo.findOne({ where: { id } });

    if (!notification) {
      throw new BadRequestException(`Notification with ID ${id} not found`);
    }

    notification.read = dto.read;

    const saved = await this.notificationRepo.save(notification);
    return this.mapNotificationToDto(saved);
  }

  private buildNotificationMessage(
    type: NotificationType,
    actor: { firstName: string; lastName: string },
  ): string {
    const name = `${actor.firstName} ${actor.lastName}`;

    switch (type) {
      case NotificationType.FOLLOW:
        return `${name} started following you`;
      case NotificationType.POST_LIKE:
        return `${name} liked your post`;
      case NotificationType.POST_REACTION:
        return `${name} reacted to your post`;
      case NotificationType.POST_COMMENT:
        return `${name} commented on your post`;
      case NotificationType.COMMENT_LIKE:
        return `${name} liked your comment`;
      case NotificationType.COMMENT_REACTION:
        return `${name} reacted to your comment`;
      case NotificationType.MESSAGE_LIKE:
        return `${name} liked your message`;
      case NotificationType.MESSAGE_REACTION:
        return `${name} reacted to your message`;
      default:
        return `${name} sent you a notification`;
    }
  }
}
