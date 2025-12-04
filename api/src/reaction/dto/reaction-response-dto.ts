import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SafeUserDto } from 'src/user/dto';

export class ReactionResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  user: SafeUserDto;

  @Expose()
  @ApiProperty()
  reaction: number;

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
