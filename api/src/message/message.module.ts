import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { User } from 'src/user/entities/user.entity';
import { ConversationModule } from 'src/conversation/conversation.module';
import { UserModule } from 'src/user/user.module';
import { Message, MessageRead } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    TypeOrmModule.forFeature([MessageRead]),
    TypeOrmModule.forFeature([User]),
    forwardRef(() => ConversationModule),
    UserModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
