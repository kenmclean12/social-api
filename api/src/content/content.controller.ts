import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { ContentType } from './entity/content.entity';
import { JwtAuthGuard } from 'src/auth/guards';
import { Response } from 'express';
import { ContentResponseDto } from './dto';

@Controller('content')
@ApiTags('Content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @ApiOkResponse({ type: ContentResponseDto })
  @ApiOperation({ description: 'Get a content item by Content ID' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ContentResponseDto> {
    return await this.contentService.findOne(id);
  }

  @Get(':id/file')
  @ApiOperation({
    description: 'Get raw file data for a content record by Content ID',
  })
  async getFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const content = await this.contentService.findOneInternal(id);
    const mime =
      content.type === ContentType.IMAGE
        ? 'image/jpeg'
        : content.type === ContentType.VIDEO
          ? 'video/mp4'
          : content.type === ContentType.AUDIO
            ? 'audio/mpeg'
            : 'application/octet-stream';

    res.set({
      'Content-Type': mime,
      'Content-Length': content.data.length,
      'Content-Disposition': 'inline',
    });

    res.send(content.data);
  }
}
