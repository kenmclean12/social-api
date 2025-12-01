import { OmitType } from '@nestjs/swagger';
import { MessageCreateDto } from './message-create.dto';

export class MessageUpdateDto extends OmitType(MessageCreateDto, [
  'conversationId',
  'senderId',
]) {}
