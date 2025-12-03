import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '../entity/content.entity';

export class ContentResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ enum: ContentType })
  type: ContentType;

  @ApiProperty()
  url: string;

  constructor(partial: Partial<ContentResponseDto>) {
    Object.assign(this, partial);
  }
}
