import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @ManyToOne(() => User, (user) => user.sentMessages)
  @ApiProperty({ type: () => User })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  @ApiProperty({ type: () => User })
  recipent: User;
}
