import { ApiProperty } from '@nestjs/swagger';
import { ConversationResponseDto } from './conversation-response.dto';
import { MessageResponseDto } from 'src/message/dto';
import { Expose, Type } from 'class-transformer';

export class InitiateConversationResponseDto {
  @Expose()
  @Type(() => ConversationResponseDto)
  @ApiProperty({ type: () => ConversationResponseDto })
  conversation: ConversationResponseDto;

  @Expose()
  @Type(() => MessageResponseDto)
  @ApiProperty({ type: () => MessageResponseDto })
  firstMessage: MessageResponseDto;
}
