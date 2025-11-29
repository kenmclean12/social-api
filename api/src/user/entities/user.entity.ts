import { ApiProperty } from '@nestjs/swagger';
import { Follow } from 'src/follow/entities/follow.entity';
import { Message } from 'src/message/entities/message.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ type: 'varchar', length: 30 })
  @ApiProperty()
  firstName: string;

  @Column({ type: 'varchar', length: 30 })
  @ApiProperty()
  lastName: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  @ApiProperty()
  userName: string;

  @Column({ type: 'int' })
  @ApiProperty()
  age: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @ApiProperty()
  phoneNumber?: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @ApiProperty()
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty()
  hashedPassword: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  @ApiProperty()
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty()
  avatarUrl?: string;

  @OneToMany(() => Follow, (follow) => follow.follower)
  @ApiProperty({ type: () => [Follow], required: false })
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  @ApiProperty({ type: () => [Follow], required: false })
  followers: Follow[];

  @OneToMany(() => Message, (message) => message.sender)
  @ApiProperty({ type: () => [Message], required: false })
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.recipents)
  @ApiProperty({ type: () => [Message], required: false })
  receivedMessages: Message[];
}
