import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Message } from 'src/message/entities/message.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  FOLLOW = 'FOLLOW',

  POST_LIKE = 'POST_LIKE',
  POST_COMMENT = 'POST_COMMENT',
  POST_REACTION = 'POST_REACTION',

  COMMENT_LIKE = 'COMMENT_LIKE',
  COMMENT_REACTION = 'COMMENT_REACTION',
  COMMENT_REPLY = 'COMMENT_REPLY',

  MESSAGE_LIKE = 'MESSAGE_LIKE',
  MESSAGE_REACTION = 'MESSAGE_REACTION',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 123 })
  id: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ type: () => User })
  recipient: User;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty({ type: () => User })
  actionUser: User;

  @Column({ type: 'enum', enum: NotificationType })
  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ManyToOne(() => UserPost, { nullable: true, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => UserPost, nullable: true })
  post?: UserPost;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Comment, nullable: true })
  comment?: Comment;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Comment, nullable: true })
  parentComment?: Comment;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Message, nullable: true })
  message?: Message;

  @Column({ default: false })
  @ApiProperty({ example: false })
  read: boolean;
}
