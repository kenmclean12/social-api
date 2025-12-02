import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({
  cors: true,
})
export class NotificationsGateway {
  @WebSocketServer() server;

  handleConnection(client: any) {
    const userId = client.handshake.auth.userId;
    if (!userId) return;

    client.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  }

  sendNotification(userId: number, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }
}
