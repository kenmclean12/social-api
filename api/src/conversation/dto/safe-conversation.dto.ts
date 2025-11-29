import { ApiProperty } from '@nestjs/swagger';
import { SafeUserDto } from 'src/user/dto/safe-user.dto';
import { Message } from 'src/message/entities/message.entity';
import { Expose } from 'class-transformer';

export class SafeConversationDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ description: 'Group chat name if any' })
  name?: string;

  @Expose()
  @ApiProperty({ type: () => SafeUserDto })
  initiator: SafeUserDto;

  @Expose()
  @ApiProperty({ type: () => [SafeUserDto] })
  participants: SafeUserDto[];

  @Expose()
  @ApiProperty({ type: () => [Message] })
  messages: Message[];

  @Expose()
  @ApiProperty()
  closed: boolean;
}
