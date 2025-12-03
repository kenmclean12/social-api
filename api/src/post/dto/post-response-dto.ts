import { ApiProperty } from '@nestjs/swagger';
import { ContentResponseDto } from 'src/content/dto';

export class PostResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => ContentResponseDto, isArray: true })
  contents: ContentResponseDto[];

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
