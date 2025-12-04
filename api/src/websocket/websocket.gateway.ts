import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { MessageService } from 'src/message/message.service';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) return client.disconnect();

      const user = await this.userService.findByTokenInternal(token as string);
      if (!user) return client.disconnect();

      client.data.user = user;
      await client.join(`user_${user.id}`);

      console.log(`WS Connected: ${user.firstName} ${user.lastName}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data?.user;
    if (user) console.log(`WS Disconnected: ${user.username}`);
  }

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(`conversation_${data.conversationId}`);
    return { joined: data.conversationId };
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody()
    body: {
      senderId: number;
      conversationId: number;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;

    const message = await this.messageService.create(body);

    this.server
      .to(`conversation_${body.conversationId}`)
      .emit('message:new', message);

    return message;
  }

  sendNotification(userId: number, notif: any) {
    this.server.to(`user_${userId}`).emit('notification', notif);
  }
}
