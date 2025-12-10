import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';

export class ConversationResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  name?: string;

  @Expose()
  @ApiProperty()
  closed: boolean;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  initiator: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: () => UserResponseDto })
  participants: UserResponseDto[];
}
