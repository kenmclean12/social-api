import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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
  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;
}
