import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { User } from 'src/user/entities/user.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Message } from 'src/message/entities';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
import { PostModule } from 'src/post/post.module';
import { CommentModule } from 'src/comment/comment.module';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Like, UserPost, User, Message]),
    MessageModule,
    PostModule,
    CommentModule,
    AuthModule,
    NotificationModule,
    forwardRef(() => UserModule),
  ],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
