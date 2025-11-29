import { ApiProperty } from '@nestjs/swagger';
import { Reaction } from 'src/common/types';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @Column({ type: 'varchar', length: 500 })
  @ApiProperty()
  content: string;

  @Column('jsonb', { default: [] })
  @ApiProperty()
  reactions: Reaction[];

  @ManyToOne(() => User, (user) => user.sentMessages)
  @ApiProperty({ type: () => User })
  sender: User;

  @ManyToMany(() => User, (user) => user.receivedMessages)
  @JoinTable()
  @ApiProperty({ type: () => [User] })
  recipents: User[];
}
