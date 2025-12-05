import { Message } from 'src/message/entities';
import { ApiProperty } from '@nestjs/swagger';
import { ConversationResponseDto } from './conversation-response.dto';

export class InitiateConversationResponseDto {
  @ApiProperty({ type: ConversationResponseDto })
  conversation: ConversationResponseDto;

  @ApiProperty({ type: Message })
  firstMessage: Message;
}
