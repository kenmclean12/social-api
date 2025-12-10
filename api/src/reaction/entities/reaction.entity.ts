import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/comment/entities/comment.entity';
import { Message } from 'src/message/entities';
import { UserPost } from 'src/post/entities/user-post.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @CreateDateColumn()
  @ApiProperty({ type: () => Date })
  createdAt: Date;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => User })
  user: User;

  @Column({ type: 'varchar', length: 200 })
  @ApiProperty({ example: 'like' })
  reaction: string;

  @ManyToOne(() => Message, (m) => m.reactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => Message, required: false })
  message?: Message;

  @ManyToOne(() => UserPost, (u) => u.reactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => UserPost, required: false })
  post?: UserPost;

  @ManyToOne(() => Comment, (c) => c.reactions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => Comment, required: false })
  comment?: Comment;
}
