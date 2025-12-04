import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { Message } from 'src/message/entities';
import { Comment } from 'src/comment/entities/comment.entity';
import { UserResponseDto } from 'src/user/dto';

export class SafeNotificationDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  recipient: UserResponseDto;

  @Expose()
  @ApiProperty()
  actionUser: UserResponseDto;

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
