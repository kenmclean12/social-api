import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @ApiProperty({ example: 'Appleseed' })
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  @ApiProperty({ example: 'johnappleseed123' })
  userName: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({ example: 24 })
  age: number;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  @ApiProperty({ example: '16042223333' })
  phoneNumber?: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  @ApiProperty({ example: 'johnappleseed@gmail.com' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'strongpassword123' })
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @ApiProperty({ example: 'Just a regular user.' })
  description?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({ example: 'http://avatars.com/avatar/123' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'hijofasu8r389fh9qw80eu' })
  hashedRefreshToken?: string;
}
