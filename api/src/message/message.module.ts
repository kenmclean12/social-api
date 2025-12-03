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
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, MessageRead, User, Like, Reaction]),
    forwardRef(() => ConversationModule),
    forwardRef(() => UserModule),
    AuthModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
