import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class MessageCreateDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  senderId: number;

  @ApiProperty({
    example: 'Hi',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;

  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  conversationId: number;
}
