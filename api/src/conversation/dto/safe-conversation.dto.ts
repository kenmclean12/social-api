import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from 'src/user/dto/safe-user.dto';
import { Message } from 'src/message/entities/message.entity';

export class SafeConversationDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ description: 'Group chat name if any' })
  name?: string;

  @ApiProperty({ type: () => SafeUserDto })
  initiator: SafeUserDto;

  @ApiProperty({ type: () => [SafeUserDto] })
  participants: SafeUserDto[];

  @ApiProperty({ type: () => [Message] })
  messages: Message[];

  @ApiProperty()
  closed: boolean;
}
