import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ContentCreateDto } from 'src/content/dto';

export class PostCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  userId: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  @ApiProperty({ required: false })
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiProperty({ required: false })
  textContent?: string;

  @IsOptional()
  @IsArray()
  @ApiProperty({ type: () => [ContentCreateDto], required: false })
  attachments?: ContentCreateDto[];
}
