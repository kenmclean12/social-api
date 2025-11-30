import { ApiProperty } from '@nestjs/swagger';
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
import { Expose } from 'class-transformer';

interface Reaction {
  messageId: string;
  userId: number;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

@Entity()
export class Message {
  @Expose()
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Expose()
  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @Column({ type: 'varchar', length: 500 })
  @ApiProperty()
  content: string;

  @Expose()
  @Column('jsonb', { default: [] })
  @ApiProperty()
  reactions: Reaction[];

  @Expose()
  @ManyToOne(() => User, (user) => user.sentMessages, { nullable: false })
  @ApiProperty({ type: () => User })
  sender: User;

  @Expose()
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @ApiProperty({ type: () => Conversation })
  conversation: Conversation;

  @Expose()
  @OneToMany(() => MessageRead, (read) => read.message, { cascade: true })
  reads: MessageRead[];

  @Expose()
  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;

  @Expose()
  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isDeleted: boolean;
}
