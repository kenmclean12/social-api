import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LikeResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  userId: number;

  @Expose()
  @ApiProperty()
  messageId?: number;

  @Expose()
  @ApiProperty()
  postId?: number;

  @Expose()
  @ApiProperty()
  commentId?: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;
}
