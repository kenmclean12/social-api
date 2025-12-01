import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation-create.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class ConversationUpdateDto extends OmitType(ConversationCreateDto, [
  'recipientIds',
  'initiatorId',
] as const) {
  @IsBoolean()
  @IsOptional()
  @ApiProperty({ example: false })
  closed: boolean;
}
