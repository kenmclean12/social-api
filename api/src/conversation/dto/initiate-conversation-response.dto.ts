import { Message } from 'src/message/entities';
import { SafeConversationDto } from './safe-conversation.dto';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateConversationResponseDto {
  @ApiProperty({ type: SafeConversationDto })
  conversation: SafeConversationDto;

  @ApiProperty({ type: Message })
  firstMessage: Message;
}
