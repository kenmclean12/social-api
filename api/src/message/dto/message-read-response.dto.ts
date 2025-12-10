import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';

export class MessageReadResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  messageId: number;

  @Expose()
  @ApiProperty()
  conversationId: number;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ type: () => Date })
  readAt: Date;
}
