import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class MessageReaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Message, (message) => message.reactions, {
    onDelete: 'CASCADE',
  })
  message: Message;

  @Column()
  userId: number;

  @Column()
  userName: string;

  @Column()
  emoji: string;

  @CreateDateColumn()
  createdAt: Date;
}
