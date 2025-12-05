import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { Message } from 'src/message/entities';
import { Comment } from 'src/comment/entities/comment.entity';
import { UserResponseDto } from 'src/user/dto';

export class NotificationResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  recipient: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  actionUser: UserResponseDto;

  @Expose()
  @ApiProperty()
  type: NotificationType;

  @Expose()
  @Type(() => UserPost)
  @ApiProperty({ type: () => UserPost, required: false })
  post?: UserPost;

  @Expose()
  @Type(() => Comment)
  @ApiProperty({ type: () => Comment, required: false })
  comment?: Comment;

  @Expose()
  @Type(() => Message)
  @ApiProperty({ type: () => Message, required: false })
  message?: Message;

  @Expose()
  @ApiProperty()
  read: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
