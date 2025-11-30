import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Message } from 'src/message/entities';
import { SafeUserDto } from 'src/user/dto';

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
  @Type(() => SafeUserDto)
  @ApiProperty({ type: () => SafeUserDto })
  initiator: SafeUserDto;

  @Expose()
  @Type(() => SafeUserDto)
  @ApiProperty({ type: () => [SafeUserDto] })
  participants: SafeUserDto[];

  @Expose()
  @Type(() => Message)
  @ApiProperty({ type: () => [Message] })
  messages: Message[];

  @Expose()
  @ApiProperty()
  closed: boolean;
}
