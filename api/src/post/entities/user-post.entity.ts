import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/like/entities/like.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserPost {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Column({ type: 'varchar', length: 150, nullable: true })
  @ApiProperty()
  title?: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  @ApiProperty()
  textContent?: string;

  @Expose()
  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  @ApiProperty({ type: () => User })
  creator: User;

  @Expose()
  @OneToMany(() => Like, (like) => like.post)
  @ApiProperty({ type: () => [Like] })
  likes: Like[];

  @Expose()
  @OneToMany(() => Comment, (c) => c.post)
  @ApiProperty({ type: () => [Comment] })
  comments: Comment[];

  @Expose()
  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;
}
