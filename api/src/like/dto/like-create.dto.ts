import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class LikeCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  userId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 10, required: false })
  messageId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 5, required: false })
  postId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 3, required: false })
  commentId?: number;
}
