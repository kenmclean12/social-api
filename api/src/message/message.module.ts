import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { User } from 'src/user/entities/user.entity';
import { ConversationModule } from 'src/conversation/conversation.module';
import { UserModule } from 'src/user/user.module';
import { Message, MessageRead } from './entities';
import { Like } from 'src/like/entities/like.entity';
import { Reaction } from 'src/reaction/entities/reaction.entity';
import { Content } from 'src/content/entity/content.entity';
import { ContentModule } from 'src/content/content.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      MessageRead,
      User,
      Like,
      Reaction,
      Content,
    ]),
    forwardRef(() => ConversationModule),
    UserModule,
    forwardRef(() => ContentModule),
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
