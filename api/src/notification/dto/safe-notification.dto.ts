import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SafeUserDto } from 'src/user/dto';
import { NotificationType } from '../entities/notification.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { Message } from 'src/message/entities';

export class SafeNotificationDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  recipient: SafeUserDto;

  @Expose()
  @ApiProperty()
  actionUser: SafeUserDto;

  @Expose()
  @ApiProperty()
  type: NotificationType;

  @Expose()
  @ApiProperty()
  post?: UserPost;

  @Expose()
  @ApiProperty()
  comment?: Comment;

  @Expose()
  @ApiProperty()
  message?: Message;

  @Expose()
  @ApiProperty()
  read: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
