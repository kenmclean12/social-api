import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';

export class ReactionResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ type: () => Date })
  createdAt: Date;

  @Expose()
  @ApiProperty()
  user: UserResponseDto;

  @Expose()
  @ApiProperty()
  reaction: string;

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
