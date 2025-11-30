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
import { Like } from 'src/like/entities/like.entity';
import { Reaction } from 'src/reaction/entities/reaction.entity';

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
  @ManyToOne(() => User, (user) => user.sentMessages, { nullable: false })
  @ApiProperty({ type: () => User })
  sender: User;

  @Expose()
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  @ApiProperty({ type: () => Conversation })
  conversation: Conversation;

  @Expose()
  @OneToMany(() => MessageRead, (read) => read.message, { cascade: true })
  @ApiProperty({ type: () => MessageRead })
  reads: MessageRead[];

  @Expose()
  @OneToMany(() => Like, (like) => like.message)
  @ApiProperty({ type: () => [Like] })
  likes?: Like[];

  @Expose()
  @OneToMany(() => Reaction, (r) => r.message)
  @ApiProperty({ type: () => [Reaction] })
  reactions?: Reaction[];

  @Expose()
  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;

  @Expose()
  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isDeleted: boolean;
}
