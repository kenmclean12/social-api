import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ContentType } from '../entity/content.entity';

export class ContentCreateDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  messageId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  postId?: number;

  @IsNotEmpty()
  @IsEnum(ContentType)
  @ApiProperty({ enum: ContentType })
  type: ContentType;

  @IsNotEmpty()
  @ApiProperty({ type: 'string', format: 'binary' })
  data: Buffer;

  @IsOptional()
  @ApiProperty({ required: false })
  filename?: string;
}
