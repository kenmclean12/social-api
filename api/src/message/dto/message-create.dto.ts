import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  conversationId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Post Content' })
  content: string;
}
