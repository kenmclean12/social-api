import { forwardRef, Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UserPost } from './entities/user-post.entity';
import { Like } from 'src/like/entities/like.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Reaction } from 'src/reaction/entities/reaction.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPost, User, Like, Comment, Reaction]),
    forwardRef(() => UserModule),
    AuthModule,
  ],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
