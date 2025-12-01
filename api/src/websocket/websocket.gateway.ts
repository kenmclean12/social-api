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

@WebSocketGateway({
  cors: {
    origin: process.env.WS_CORS_ORIGIN,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly messageService: MessageService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string;

      if (!token) {
        client.disconnect();
        return;
      }

      const user = await this.userService.findByToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      client.data.user = user;
      console.log(`WS Connected: ${user.firstName} ${user.lastName}`);
    } catch (err) {
      console.error('WS Connection Error:', err);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = client.data?.user;
    if (user) console.log(`WS Disconnected: ${user.username}`);
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    @MessageBody()
    body: { senderId: number; conversationId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    if (!user) return;

    const message = await this.messageService.create({
      ...body,
      attachments: undefined,
    });

    this.server.to(this.room(body.conversationId)).emit('message:new', message);

    return message;
  }

  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    await client.join(this.room(data.conversationId));
    return { joined: data.conversationId };
  }

  private room(id: number): string {
    return `conversation_${id}`;
  }
}
