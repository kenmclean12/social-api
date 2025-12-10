import { NotificationType } from '../entities/notification.entity';

export function buildNotificationMessage(
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
    case NotificationType.COMMENT_REPLY:
      return `${name} replied to your comment`;
    case NotificationType.MESSAGE_LIKE:
      return `${name} liked your message`;
    case NotificationType.MESSAGE_REACTION:
      return `${name} reacted to your message`;
    default:
      return `${name} sent you a notification`;
  }
}
