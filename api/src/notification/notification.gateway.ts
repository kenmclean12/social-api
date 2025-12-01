import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({
  cors: true,
})
export class NotificationsGateway {
  @WebSocketServer() server;

  sendNotification(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
