import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { CommentResponseDto } from 'src/comment/dto';
import { LikeResponseDto } from 'src/like/dto';
import { ReactionResponseDto } from 'src/reaction/dto';
import { UserResponseDto } from 'src/user/dto';

export class PostResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  textContent?: string;

  @Expose()
  @ApiProperty()
  contentUrl?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: () => [UserResponseDto] })
  creator: UserResponseDto[];

  @Expose()
  @ApiProperty({ type: () => [LikeResponseDto] })
  likes?: LikeResponseDto[];

  @Expose()
  @ApiProperty({ type: () => [CommentResponseDto] })
  comments?: CommentResponseDto[];

  @Expose()
  @ApiProperty({ type: () => [ReactionResponseDto] })
  reactions?: ReactionResponseDto[];

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}
