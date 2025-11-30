import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageCreateBase {
  senderId: number;
  content: string;
  conversationId: number;
}

export class MessageCreateDto extends MessageCreateBase {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  declare userId: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 1 })
  declare conversationId: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Message Content' })
  declare content: string;
}
