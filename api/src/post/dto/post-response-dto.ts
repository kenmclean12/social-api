import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title?: string;

  @ApiProperty()
  textContent?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  creatorId: number;

  @ApiProperty()
  commentCount: number;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  reactionCount: number;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}
