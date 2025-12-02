import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Message } from 'src/message/entities';
import { UserPost } from 'src/post/entities/user-post.entity';
import { User } from 'src/user/entities/user.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';
import { CommentModule } from 'src/comment/comment.module';
import { MessageModule } from 'src/message/message.module';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notification.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, UserPost, Comment, Message]),
    forwardRef(() => UserModule),
    forwardRef(() => PostModule),
    CommentModule,
    MessageModule,
    AuthModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationsGateway],
  exports: [NotificationService, NotificationsGateway],
})
export class NotificationModule {}
