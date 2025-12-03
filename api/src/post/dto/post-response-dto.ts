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
  attachments: ContentResponseDto[];

  @ApiProperty()
  creatorId: number;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}
