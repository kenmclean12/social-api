import { PartialType } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation.create.dto';

export class ConversationUpdateDto extends PartialType(ConversationCreateDto) {}
