import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';
import { MessageReadResponseDto } from './message-read-response.dto';

export class MessageResponseDto {
  @Expose()
  @ApiProperty({ type: 'number' })
  id: number;

  @Expose()
  @ApiProperty({ type: () => Date })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: 'string' })
  content: string;

  @Expose()
  @ApiProperty({ type: UserResponseDto })
  sender?: UserResponseDto;

  @Expose()
  @ApiProperty({ type: 'number' })
  conversationId: number;

  @Expose()
  @ApiProperty({ type: MessageReadResponseDto })
  reads?: MessageReadResponseDto[];

  @Expose()
  @ApiProperty({ type: () => Date })
  editedAt?: Date;

  @Expose()
  @ApiProperty({ type: 'boolean' })
  isDeleted?: boolean;
}
