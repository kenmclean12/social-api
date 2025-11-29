import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from 'src/user/entities/user.entity';

@Entity()
export class MessageRead {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, (message) => message.reads, { onDelete: 'CASCADE' })
  message: Message;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @CreateDateColumn()
  readAt: Date;
}
