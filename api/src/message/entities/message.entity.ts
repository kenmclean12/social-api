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

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  readAt?: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  editedAt?: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty()
  isDeleted: boolean;
}
