import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CommentCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  postId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ required: false })
  parentCommentId?: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(400)
  @ApiProperty({ maxLength: 400 })
  content: string;
}
