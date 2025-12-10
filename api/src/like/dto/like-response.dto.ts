import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class LikeResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ type: () => Date })
  createdAt: Date;

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
}
