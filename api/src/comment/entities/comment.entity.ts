import { ApiProperty } from '@nestjs/swagger';
import { UserPost } from 'src/post/entities/user-post.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
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

  @ManyToOne(() => UserPost, { nullable: false, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => UserPost })
  post: UserPost;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @ApiProperty({ type: () => Comment, nullable: true })
  parentComment?: Comment;

  @OneToMany(() => Comment, (c) => c.parentComment)
  @ApiProperty({ type: () => [Comment], isArray: true })
  replies?: Comment[];

  @Column({ length: 400 })
  @ApiProperty({ type: 'string', maxLength: 400 })
  content: string;
}
