import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class MessageActionDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty()
  userId: number;
}
