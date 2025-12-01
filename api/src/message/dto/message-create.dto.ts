import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ContentCreateDto } from 'src/content/dto/content-create.dto';

export class MessageCreateBase {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  senderId: number;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  conversationId: number;
}

export class MessageCreateDto extends MessageCreateBase {
  @IsOptional()
  @IsArray()
  @ApiProperty({ type: () => [ContentCreateDto], required: false })
  attachments?: ContentCreateDto[];
}
