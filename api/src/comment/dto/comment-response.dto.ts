import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { LikeResponseDto } from 'src/like/dto';
import { ReactionResponseDto } from 'src/reaction/dto';
import { UserResponseDto } from 'src/user/dto';

export class CommentResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  content: string;

  @Expose()
  @ApiProperty()
  user: UserResponseDto;

  @Expose()
  @ApiProperty()
  postId: number;

  @Expose()
  @ApiProperty()
  parentCommentId?: number;

  @Expose()
  @ApiProperty()
  replies?: CommentResponseDto[];
}
