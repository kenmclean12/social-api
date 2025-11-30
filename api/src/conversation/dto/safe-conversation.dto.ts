import { Expose, Type } from 'class-transformer';
import { Message } from 'src/message/entities';
import { User } from 'src/user/entities/user.entity';

export class SafeConversationDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  closed: boolean;

  @Expose()
  @Type(() => User)
  initiator: User;

  @Expose()
  @Type(() => User)
  participants: User[];

  @Expose()
  @Type(() => Message)
  messages: Message[];
}
