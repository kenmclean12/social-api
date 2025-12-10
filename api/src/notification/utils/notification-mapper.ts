import { convertToResponseDto } from 'src/common/utils';
import { NotificationResponseDto } from '../dto';
import { Notification } from '../entities/notification.entity';
import { UserResponseDto } from 'src/user/dto';
import { postMapper } from 'src/post/utils/post-mapper';
import { commentMapper } from 'src/comment/utils/comment-mapper';
import { messageMapper } from 'src/message/utils/message-mapper';
import { buildNotificationMessage } from './build-notification-message';

export function notificationMapper(n: Notification): NotificationResponseDto {
  const dto = convertToResponseDto(NotificationResponseDto, {
    ...n,
    recipient: convertToResponseDto(UserResponseDto, n.recipient),
    actionUser: convertToResponseDto(UserResponseDto, n.actionUser),
    post: n.post ? postMapper(n.post) : undefined,
    comment: n.comment ? commentMapper(n.comment) : undefined,
    parentComment: n.parentComment ? commentMapper(n.parentComment) : undefined,
    message: n.message ? messageMapper(n.message) : undefined,
  });

  dto.notificationMessage = buildNotificationMessage(n.type, n.actionUser);
  return dto;
}
