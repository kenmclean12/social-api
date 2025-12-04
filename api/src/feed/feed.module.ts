import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowModule } from 'src/follow/follow.module';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { UserPost } from 'src/post/entities/user-post.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPost]),
    FollowModule,
    AuthModule,
    PostModule,
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
