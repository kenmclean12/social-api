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

  MESSAGE_LIKE = 'MESSAGE_LIKE',
  MESSAGE_REACTION = 'MESSAGE_REACTION',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty()
  recipient: User;

  @ManyToOne(() => User, { eager: true })
  @ApiProperty()
  actionUser: User;

  @Column({ type: 'enum', enum: NotificationType })
  @ApiProperty()
  type: NotificationType;

  @ManyToOne(() => UserPost, { nullable: true, onDelete: 'CASCADE' })
  post?: UserPost;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  comment?: Comment;

  @ManyToOne(() => Message, { nullable: true, onDelete: 'CASCADE' })
  message?: Message;

  @ApiProperty()
  @Column({ default: false })
  read: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;
}
