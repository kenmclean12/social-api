import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation]),
    AuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
