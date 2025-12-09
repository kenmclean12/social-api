import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/like/entities/like.entity';
import { Reaction } from 'src/reaction/entities/reaction.entity';
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

  @Column({ type: 'varchar', length: 500, nullable: true })
  @ApiProperty()
  textContent?: string;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty()
  contentUrl?: string;

  @Expose()
  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  @ApiProperty({ type: () => User })
  creator: User;

  @Expose()
  @OneToMany(() => Like, (like) => like.post)
  @ApiProperty({ type: () => [Like] })
  likes: Like[];

  @Expose()
  @OneToMany(() => Reaction, (r) => r.post)
  @ApiProperty({ type: () => [Reaction] })
  reactions: Reaction[];

  @Expose()
  @OneToMany(() => Comment, (c) => c.post)
  @ApiProperty({ type: () => [Comment] })
  comments: Comment[];

  @Expose()
  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;
}
