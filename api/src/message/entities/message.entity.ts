import { ApiProperty } from '@nestjs/swagger';
import { Reaction } from 'src/common/types';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @ApiProperty({ type: () => Conversation })
  conversation: Conversation;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  readAt?: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isDeleted: boolean;
}
