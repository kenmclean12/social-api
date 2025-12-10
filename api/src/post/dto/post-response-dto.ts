import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
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
  @Type(() => Date)
  @ApiProperty({ type: () => Date })
  createdAt: Date;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => [UserResponseDto] })
  creator: UserResponseDto[];

  @Expose()
  @Type(() => LikeResponseDto)
  @ApiProperty({ type: () => [LikeResponseDto] })
  likes?: LikeResponseDto[];

  @Expose()
  @Type(() => CommentResponseDto)
  @ApiProperty({ type: () => [CommentResponseDto] })
  comments?: CommentResponseDto[];

  @Expose()
  @Type(() => ReactionResponseDto)
  @ApiProperty({ type: () => [ReactionResponseDto] })
  reactions?: ReactionResponseDto[];
}
