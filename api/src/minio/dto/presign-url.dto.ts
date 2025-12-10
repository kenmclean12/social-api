import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PresignUrlDto {
  @ApiProperty({
    description: 'The file name (including extension) to upload to minio.',
    example: 'photo.png',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
