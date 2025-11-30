import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Message } from 'src/message/entities/message.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiProperty({ description: 'Optional name for group chats' })
  name?: string;

  @ManyToOne(() => User, (user) => user.initiatedConversations)
  @ApiProperty({ type: () => User })
  initiator: User;

  @ManyToMany(() => User, (user) => user.participatingConversations)
  @JoinTable()
  @ApiProperty({ type: () => [User] })
  participants: User[];

  @OneToMany(() => Message, (message) => message.conversation, {
    cascade: true,
  })
  @ApiProperty({ type: () => [Message] })
  messages: Message[];

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ type: 'boolean' })
  closed: boolean;
}
