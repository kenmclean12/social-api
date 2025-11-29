import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ConversationCreateDto } from './conversation.create.dto';
import { IsString } from 'class-validator';

export type AlterParticipantType = 'add' | 'remove';

export class AlterParticipantsDto extends OmitType(ConversationCreateDto, [
  'name',
]) {
  @IsString()
  @ApiProperty()
  alterType: AlterParticipantType;
}
