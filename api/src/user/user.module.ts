import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { FollowModule } from 'src/follow/follow.module';
import { Message } from 'src/message/entities';
import { UserPost } from 'src/post/entities/user-post.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPost, Message]),
    forwardRef(() => FollowModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
