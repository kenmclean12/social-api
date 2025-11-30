import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class PostCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  userId: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @ApiProperty()
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiProperty()
  textContent?: string;
}
