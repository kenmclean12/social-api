import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entity/content.entity';
import { Message } from 'src/message/entities';
import { UserPost } from 'src/post/entities/user-post.entity';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { UserModule } from 'src/user/user.module';
import { MessageModule } from 'src/message/message.module';
import { PostModule } from 'src/post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Content, Message, UserPost]),
    UserModule,
    MessageModule,
    PostModule,
  ],
  controllers: [ContentController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}
