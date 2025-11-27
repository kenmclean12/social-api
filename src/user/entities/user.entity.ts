import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @Column({ type: 'int' })
  @ApiProperty()
  age: number;

  @Column({ type: 'varchar', length: 11, unique: true, nullable: true })
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

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  @ApiProperty({ type: () => [User] })
  following: User[];

  @ManyToMany(() => User, (user) => user.followers)
  @ApiProperty({ type: () => [User] })
  followers: User[];
}
