import { ApiProperty } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation-create.dto';
import { MessageUpdateDto, NoConversationMessageDto } from 'src/message/dto';

export class InitiateConversationDto {
  @ApiProperty({ type: () => ConversationCreateDto })
  conversation: ConversationCreateDto;

  @ApiProperty({ type: () => MessageUpdateDto })
  firstMessage: NoConversationMessageDto;
}
