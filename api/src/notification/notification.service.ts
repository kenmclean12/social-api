import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
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
import { WebsocketGateway } from 'src/websocket/websocket.gateway';
import { notificationMapper } from './utils';

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

  async findOneByIdMatch(
    recipientId: number,
    actionUserId: number,
    type: NotificationType,
  ): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: {
        recipient: { id: recipientId },
        actionUser: { id: actionUserId },
        type,
      },
    });

    if (!notification) {
      throw new NotFoundException(
        `No notification found with the provided fields - Recipient ID: ${recipientId}, Action User ID: ${actionUserId}, Notification Type: ${type}`,
      );
    }

    return notification;
  }

  async findOneInternal(id: number): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException(
        `No notification found with the provided ID: ${id}`,
      );
    }

    return notification;
  }

  async findAllForUser(userId: number): Promise<NotificationResponseDto[]> {
    const notifications = await this.notificationRepo.find({
      where: { recipient: { id: userId } },
      relations: this.getRelations(),
      order: { createdAt: 'DESC' },
    });

    return notifications.map((n) => notificationMapper(n));
  }

  async create(
    dto: NotificationCreateDto,
  ): Promise<NotificationResponseDto | void> {
    const { recipientId, actorId, type } = dto;
    if (recipientId === actorId) return;

    const recipient = await this.userService.findOneInternal(recipientId);
    const actor = await this.userService.findOneInternal(actorId);

    const payload = await this.resolveNotificationContext(dto);
    const notification: Notification = await this.notificationRepo.save({
      recipient,
      actionUser: actor,
      type,
      read: false,
      ...payload,
    });

    const out = notificationMapper(await this.findOneInternal(notification.id));
    this.websocketGateway.sendNotification(recipient.id, out);
    return out;
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
    return notificationMapper(saved);
  }

  async markAllRead(userId: number): Promise<void> {
    const notifications = await this.notificationRepo.find({
      where: { recipient: { id: userId } },
    });

    for (const n of notifications) {
      if (n.read === false) {
        await this.notificationRepo.save({ ...n, read: true });
      }
    }
  }

  private async resolveNotificationContext(dto: NotificationCreateDto) {
    switch (dto.type) {
      case NotificationType.FOLLOW:
        return {};

      case NotificationType.POST_LIKE:
      case NotificationType.POST_REACTION:
        return this.loadPost(dto);

      case NotificationType.POST_COMMENT:
        return this.loadPostAndComment(dto);

      case NotificationType.COMMENT_LIKE:
      case NotificationType.COMMENT_REACTION:
        return this.loadCommentWithPost(dto);

      case NotificationType.COMMENT_REPLY:
        return this.loadReplyContext(dto);

      case NotificationType.MESSAGE_LIKE:
      case NotificationType.MESSAGE_REACTION:
        return this.loadMessage(dto);

      default:
        throw new BadRequestException('Invalid notification type');
    }
  }

  private async loadPost(dto: NotificationCreateDto) {
    if (!dto.postId) throw new BadRequestException('postId is required');
    const post = await this.postService.findOneInternal(dto.postId);
    return { post };
  }

  private async loadPostAndComment(dto: NotificationCreateDto) {
    if (!dto.postId || !dto.commentId) {
      throw new BadRequestException('postId and commentId are required');
    }

    const post = await this.postService.findOneInternal(dto.postId);
    const comment = await this.commentService.findOneInternal(dto.commentId);
    return { post, comment };
  }

  private async loadCommentWithPost(dto: NotificationCreateDto) {
    if (!dto.commentId) throw new BadRequestException('commentId is required');
    const comment = await this.commentService.findOneInternal(dto.commentId);
    return { comment, post: comment.post };
  }

  private async loadReplyContext(dto: NotificationCreateDto) {
    if (!dto.commentId || !dto.postId || !dto.parentCommentId) {
      throw new BadRequestException(
        'commentId, postId, parentCommentId required',
      );
    }

    const comment = await this.commentService.findOneInternal(dto.commentId);
    const post = await this.postService.findOneInternal(dto.postId);
    const parentComment = await this.commentService.findOneInternal(
      dto.parentCommentId,
    );

    return { comment, post, parentComment };
  }

  private async loadMessage(dto: NotificationCreateDto) {
    if (!dto.messageId) throw new BadRequestException('messageId is required');
    const message = await this.messageService.findOneInternal(dto.messageId);
    return { message };
  }

  private getRelations() {
    return [
      'actionUser',
      'recipient',
      'post',
      'post.creator',
      'parentComment',
      'parentComment.user',
      'parentComment.post',
      'comment',
      'comment.user',
      'comment.parentComment',
      'comment.post',
      'parentComment',
      'parentComment.user',
      'parentComment.post',
      'message',
      'message.sender',
      'message.reads',
      'message.reads.user',
      'message.reads.message',
      'message.conversation',
    ];
  }
}
