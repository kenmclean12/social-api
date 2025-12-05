import { ApiProperty } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation-create.dto';
import { NoConversationMessageDto } from 'src/message/dto';

export class InitiateConversationDto {
  @ApiProperty({ type: () => ConversationCreateDto })
  conversation: ConversationCreateDto;

  @ApiProperty({ type: () => NoConversationMessageDto })
  firstMessage: NoConversationMessageDto;
}
