import { ApiProperty } from '@nestjs/swagger';
import { Message } from 'src/message/entities/message.entity';
import { UserPost } from 'src/post/entities/user-post.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

export enum ContentType {
  IMAGE = 'image',
  VIDEO = 'video',
  GIF = 'gif',
  AUDIO = 'audio',
  FILE = 'file',
}

@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'enum', enum: ContentType })
  @ApiProperty({ enum: ContentType })
  type: ContentType;

  @Column({ type: 'bytea', nullable: false })
  @ApiProperty()
  data: Buffer;

  @ManyToOne(() => Message, (m) => m.attachments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  message?: Message;

  @ManyToOne(() => UserPost, (p) => p.contents, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  post?: UserPost;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;
}
