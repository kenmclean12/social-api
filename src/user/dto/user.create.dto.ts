/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty } from '@nestjs/swagger';
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
  @IsNumber()
  @MaxLength(3)
  @ApiProperty({ example: 24 })
  age: number;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  @ApiProperty({ example: '16042223333' })
  phoneNumber?: string;

  @IsNotEmpty()
  @IsString()
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
}
