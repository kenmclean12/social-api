import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';

export class MessageReadResponseDto {
  @Expose()
  @ApiProperty({ type: 'number' })
  id: number;

  @Expose()
  @ApiProperty({ type: 'number' })
  messageId: number;

  @Expose()
  @ApiProperty({ type: 'number' })
  conversationId: number;

  @Expose()
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @Expose()
  @ApiProperty({ type: () => Date })
  readAt: Date;
}
