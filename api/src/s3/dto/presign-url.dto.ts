import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PresignUrlDto {
  @ApiProperty({
    description: 'The file name (including extension) to upload to S3.',
    example: 'photo.png',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'The MIME type of the file being uploaded.',
    example: 'image/png',
  })
  @IsString()
  @IsNotEmpty()
  type: string;
}
