import { Module } from '@nestjs/common';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reaction } from './entities/reaction.entity';
import { Message } from 'src/message/entities';
import { UserPost } from 'src/post/entities/user-post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
import { PostModule } from 'src/post/post.module';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reaction, Message, UserPost, Comment]),
    UserModule,
    MessageModule,
    PostModule,
    CommentModule,
  ],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
