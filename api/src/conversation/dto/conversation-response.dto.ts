import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto';

export class ConversationResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  closed: boolean;

  @Expose()
  @Type(() => UserResponseDto)
  initiator: UserResponseDto;

  @Expose()
  @Type(() => UserResponseDto)
  participants: UserResponseDto[];
}
