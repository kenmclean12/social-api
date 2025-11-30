import { ApiProperty } from '@nestjs/swagger';
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

  @ManyToOne(() => User, { eager: true })
  @ApiProperty()
  user: User;

  @ManyToOne(() => UserPost, { nullable: true })
  @ApiProperty()
  post?: UserPost;

  @ManyToOne(() => Comment, { nullable: true })
  @ApiProperty()
  comment?: Comment;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;
}
