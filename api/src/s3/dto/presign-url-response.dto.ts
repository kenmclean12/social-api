import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PresignUrlResponseDto {
  @ApiProperty({
    description:
      'The presigned URL used by the client to upload directly to S3.',
  })
  @IsString()
  @IsNotEmpty()
  uploadUrl: string;

  @ApiProperty({
    description: 'The public URL where the uploaded file will be accessible.',
  })
  @IsString()
  @IsNotEmpty()
  finalUrl: string;
}
