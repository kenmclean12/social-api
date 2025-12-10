import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { PresignUrlDto, PresignUrlResponseDto } from './dto';

@Controller('s3')
@ApiTags('s3')
@UseGuards(JwtAuthGuard)
export class S3Controller {
  constructor(private readonly s3: S3Service) {}

  @Post('url')
  @ApiOkResponse({ type: 'number' })
  @ApiOperation({
    description: 'Create presigned url for s3 uploads',
  })
  async createPresignedUrl(
    @Body() body: PresignUrlDto,
  ): Promise<PresignUrlResponseDto> {
    const uploadUrl = await this.s3.getPresignedUploadUrl(
      body.fileName,
      body.type,
    );

    const finalUrl = this.s3.getPublicUrl(body.fileName);

    return { uploadUrl, finalUrl };
  }
}
