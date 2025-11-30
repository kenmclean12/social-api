import { ApiProperty } from '@nestjs/swagger';
import { MessageCreateDto } from 'src/message/dto/message-create.dto';
import { ConversationCreateDto } from './conversation.create.dto';

export class InitiateConversationRequestDto {
  @ApiProperty({ type: () => ConversationCreateDto })
  conversation: ConversationCreateDto;

  @ApiProperty({ type: () => MessageCreateDto })
  firstMessage: MessageCreateDto;
}
