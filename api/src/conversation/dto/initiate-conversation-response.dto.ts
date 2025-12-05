import { ApiProperty } from '@nestjs/swagger';
import { ConversationResponseDto } from './conversation-response.dto';
import { MessageResponseDto } from 'src/message/dto';

export class InitiateConversationResponseDto {
  @ApiProperty({ type: ConversationResponseDto })
  conversation: ConversationResponseDto;

  @ApiProperty({ type: MessageResponseDto })
  firstMessage: MessageResponseDto;
}
