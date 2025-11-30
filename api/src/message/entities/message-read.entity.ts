import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Message } from './message.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class MessageRead {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => Message, (message) => message.reads, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Message })
  message: Message;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ type: () => User })
  user: User;

  @CreateDateColumn()
  @ApiProperty()
  readAt: Date;
}
