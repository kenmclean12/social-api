import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { PresignUrlDto, PresignUrlResponseDto } from './dto';
import { MinioService } from './minio.service';

@Controller('minio')
@ApiTags('minio')
@UseGuards(JwtAuthGuard)
export class MinioController {
  constructor(private readonly minio: MinioService) {}

  @Post('url')
  @ApiOkResponse({ type: 'number' })
  @ApiOperation({
    description: 'Create presigned url for minio uploads',
  })
  async createPresignedUrl(
    @Body() body: PresignUrlDto,
  ): Promise<PresignUrlResponseDto> {
    const uploadUrl = await this.minio.getPresignedUploadUrl(body.fileName);
    const finalUrl = this.minio.getPublicUrl(body.fileName);
    return { uploadUrl, finalUrl };
  }
}
