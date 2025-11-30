import { ApiProperty } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation-create.dto';
import { MessageCreateDto } from 'src/message/dto';

export class InitiateConversationDto {
  @ApiProperty({ type: () => ConversationCreateDto })
  conversation: ConversationCreateDto;

  @ApiProperty({ type: () => MessageCreateDto })
  firstMessage: MessageCreateDto;
}
