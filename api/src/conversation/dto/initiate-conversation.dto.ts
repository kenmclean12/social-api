import { ApiProperty } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation-create.dto';
import { NoConversationMessageDto } from 'src/message/dto';
import { Expose, Type } from 'class-transformer';

export class InitiateConversationDto {
  @Expose()
  @Type(() => ConversationCreateDto)
  @ApiProperty({ type: () => ConversationCreateDto })
  conversation: ConversationCreateDto;

  @Expose()
  @Type(() => NoConversationMessageDto)
  @ApiProperty({ type: () => NoConversationMessageDto })
  firstMessage: NoConversationMessageDto;
}
