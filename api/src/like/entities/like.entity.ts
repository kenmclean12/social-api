import { ApiProperty } from '@nestjs/swagger';
import { Comment } from 'src/comment/entities/comment.entity';
import { Message } from 'src/message/entities';
import { UserPost } from 'src/post/entities/user-post.entity';
import { User } from 'src/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => User })
  user: User;

  @ManyToOne(() => Message, (m) => m.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => Message, required: false })
  message?: Message;

  @ManyToOne(() => UserPost, (p) => p.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => UserPost, required: false })
  post?: UserPost;

  @ManyToOne(() => Comment, (c) => c.likes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => Comment, required: false })
  comment?: Comment;
}
