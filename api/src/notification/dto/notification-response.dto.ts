import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { NotificationType } from '../entities/notification.entity';
import { UserResponseDto } from 'src/user/dto';
import { PostResponseDto } from 'src/post/dto';
import { CommentResponseDto } from 'src/comment/dto';
import { MessageResponseDto } from 'src/message/dto';

export class NotificationResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ type: () => Date })
  createdAt: Date;

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
  @ApiProperty()
  notificationMessage: string;

  @Expose()
  @Type(() => PostResponseDto)
  @ApiProperty({ type: () => PostResponseDto, required: false })
  post?: PostResponseDto;

  @Expose()
  @Type(() => CommentResponseDto)
  @ApiProperty({ type: () => CommentResponseDto, required: false })
  comment?: CommentResponseDto;

  @Expose()
  @Type(() => MessageResponseDto)
  @ApiProperty({ type: () => MessageResponseDto, required: false })
  message?: MessageResponseDto;

  @Expose()
  @ApiProperty()
  read: boolean;
}
