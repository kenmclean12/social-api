import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Follow } from 'src/follow/entities/follow.entity';
import { Message } from 'src/message/entities';
import { UserPost } from 'src/post/entities/user-post.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @Expose()
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Expose()
  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @Column({ type: 'varchar', length: 30 })
  @ApiProperty()
  firstName: string;

  @Expose()
  @Column({ type: 'varchar', length: 30 })
  @ApiProperty()
  lastName: string;

  @Expose()
  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty()
  userName: string;

  @Expose()
  @Column({ type: 'int' })
  @ApiProperty()
  age: number;

  @Expose()
  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty()
  phoneNumber?: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  hashedPassword: string;

  @Expose()
  @Column({ type: 'varchar', length: 500, nullable: true })
  @ApiProperty()
  description?: string;

  @Expose()
  @Column({ type: 'varchar', length: 255, default: null })
  @ApiProperty()
  avatarUrl: string | null;

  @Expose()
  @Column({ type: 'varchar', default: null })
  @ApiProperty()
  hashedRefreshToken: string | null;

  @Expose()
  @OneToMany(() => UserPost, (post) => post.creator, { nullable: false })
  @ApiProperty({ type: () => UserPost })
  posts: UserPost[];

  @Expose()
  @OneToMany(() => Follow, (follow) => follow.follower)
  @ApiProperty({ type: () => [Follow], required: false })
  following: Follow[];

  @Expose()
  @OneToMany(() => Follow, (follow) => follow.following)
  @ApiProperty({ type: () => [Follow], required: false })
  followers: Follow[];

  @Expose()
  @OneToMany(() => Message, (message) => message.sender)
  @ApiProperty({ type: () => [Message] })
  sentMessages: Message[];

  @Expose()
  @OneToMany(() => Conversation, (conversation) => conversation.initiator)
  @ApiProperty({ type: () => [Conversation] })
  initiatedConversations: Conversation[];

  @Expose()
  @ManyToMany(() => Conversation)
  @ApiProperty({ type: () => [Conversation] })
  participatingConversations: User[];
}
