import { SafeConversationDto } from './safe-conversation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from 'src/message/entities/message.entity';

export class InitiateConversationResponseDto {
  @ApiProperty({ type: SafeConversationDto })
  conversation: SafeConversationDto;

  @ApiProperty({ type: Message })
  firstMessage: Message;
}
