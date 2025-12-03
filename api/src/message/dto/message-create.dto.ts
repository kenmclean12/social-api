import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MessageCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  senderId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  conversationId: number;
}
