import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @ApiProperty()
  title?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @ApiProperty()
  content?: string;
}
