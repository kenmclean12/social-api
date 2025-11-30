import { ApiProperty } from '@nestjs/swagger';
import { Reaction } from 'src/common/types';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MessageRead } from './message-read.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Column({ type: 'varchar', length: 500 })
  @ApiProperty()
  content: string;

  @Column('jsonb', { default: [] })
  @ApiProperty()
  reactions: Reaction[];

  @ManyToOne(() => User, (user) => user.sentMessages, { nullable: false })
  @ApiProperty({ type: () => User })
  sender: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @ApiProperty({ type: () => Conversation })
  conversation: Conversation;

  @OneToMany(() => MessageRead, (read) => read.message, { cascade: true })
  reads: MessageRead[];

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isDeleted: boolean;
}
