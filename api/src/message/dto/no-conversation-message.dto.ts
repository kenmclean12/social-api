import { OmitType } from '@nestjs/mapped-types';
import { MessageCreateDto } from './message-create.dto';

export class NoConversationMessageDto extends OmitType(MessageCreateDto, [
  'conversationId',
]) {}
