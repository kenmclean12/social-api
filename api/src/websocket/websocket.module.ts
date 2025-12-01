import { Module } from '@nestjs/common';
import { MessageModule } from 'src/message/message.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { UserModule } from 'src/user/user.module';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  imports: [MessageModule, ConversationModule, UserModule],
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
