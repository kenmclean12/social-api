import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class NotificationUpdateDto {
  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty()
  read: boolean;
}
