import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PostResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  title?: string;

  @Expose()
  @ApiProperty()
  textContent?: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  creatorId: number;

  constructor(partial: Partial<PostResponseDto>) {
    Object.assign(this, partial);
  }
}
