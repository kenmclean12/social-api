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
  @MaxLength(500)
  @ApiProperty({ required: false })
  textContent?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  contentUrl?: string;
}
