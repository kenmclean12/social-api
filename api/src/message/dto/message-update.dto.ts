import { PartialType } from '@nestjs/swagger';
import { MessageCreateDto } from './message-create.dto';

export class MessageUpdateDto extends PartialType(MessageCreateDto) {}
