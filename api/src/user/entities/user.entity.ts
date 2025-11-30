import { ApiProperty } from '@nestjs/swagger';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { Message } from 'src/message/entities/message.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  @ApiProperty()
  firstName: string;

  @Column({ type: 'varchar', length: 30 })
  @ApiProperty()
  lastName: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty()
  userName: string;

  @Column({ type: 'int' })
  @ApiProperty()
  age: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty()
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  hashedPassword: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @ApiProperty()
  description?: string;

  @Column({ type: 'varchar', length: 255, default: null })
  @ApiProperty()
  avatarUrl: string | null;

  @Column({ type: 'varchar', default: null })
  @ApiProperty()
  hashedRefreshToken: string | null;

  @OneToMany(() => Follow, (follow) => follow.follower)
  @ApiProperty({ type: () => [Follow], required: false })
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  @ApiProperty({ type: () => [Follow], required: false })
  followers: Follow[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Conversation, (conversation) => conversation.initiator)
  @ApiProperty({ type: () => [Conversation] })
  initiatedConversations: Conversation[];

  @ManyToMany(() => Conversation)
  @ApiProperty({ type: () => [Conversation] })
  participatingConversations: User[];
}
