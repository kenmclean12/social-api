import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { User } from 'src/user/entities/user.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Message } from 'src/message/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Like, UserPost, User, Message])],
  controllers: [LikeController],
  providers: [LikeService],
  exports: [LikeService],
})
export class LikeModule {}
