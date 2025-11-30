import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation-create.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class ConversationUpdateDto extends PartialType(
  OmitType(ConversationCreateDto, ['initiatorId', 'recipientIds'] as const),
) {
  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  closed: boolean;
}
