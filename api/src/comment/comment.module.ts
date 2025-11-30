import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { UserModule } from 'src/user/user.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([UserPost]),
    UserModule,
    PostModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
