import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';
import { MessageReadResponseDto } from './message-read-response.dto';
import { LikeResponseDto } from 'src/like/dto';
import { ReactionResponseDto } from 'src/reaction/dto';

export class MessageResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ type: () => Date })
  createdAt: Date;

  @Expose()
  @ApiProperty()
  content: string;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  sender: UserResponseDto;

  @Expose()
  @ApiProperty()
  conversationId: number;

  @Expose()
  @Type(() => MessageReadResponseDto)
  @ApiProperty({ type: () => MessageReadResponseDto, isArray: true })
  reads?: MessageReadResponseDto[];

  @Expose()
  @Type(() => LikeResponseDto)
  @ApiProperty({ type: () => LikeResponseDto, isArray: true })
  likes?: LikeResponseDto[];

  @Expose()
  @Type(() => ReactionResponseDto)
  @ApiProperty({ type: () => ReactionResponseDto, isArray: true })
  reactions?: ReactionResponseDto[];

  @Expose()
  @Type(() => Date)
  @ApiProperty({ type: () => Date, required: false })
  editedAt?: Date;

  @Expose()
  @ApiProperty()
  isDeleted: boolean;
}
