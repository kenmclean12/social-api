import { ApiProperty } from '@nestjs/swagger';
import { Like } from 'src/like/entities/like.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @ManyToOne(() => User, { nullable: false })
  @ApiProperty({ type: () => User })
  user: User;

  @ManyToOne(() => UserPost, (post) => post.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @ApiProperty({ type: () => UserPost })
  post: UserPost;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentCommentId' })
  @ApiProperty({ type: () => Comment, nullable: true })
  parentComment?: Comment;

  @OneToMany(() => Like, (like) => like.comment)
  @ApiProperty({ type: () => [Like] })
  likes?: Like[];

  @OneToMany(() => Comment, (c) => c.parentComment)
  @ApiProperty({ type: () => [Comment], isArray: true })
  replies?: Comment[];

  @Column({ length: 400 })
  @ApiProperty({ type: 'string', maxLength: 400 })
  content: string;
}
