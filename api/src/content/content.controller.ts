import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Content } from './entity/content.entity';
import { ContentCreateDto } from './dto/content-create.dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('content')
@ApiTags('Content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @ApiOkResponse({ type: Content })
  @ApiOperation({ description: 'Get a content item by Content ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Content> {
    return await this.contentService.findOne(id);
  }

  @ApiOkResponse({ type: [Content] })
  @ApiOperation({ description: 'Get all content entries' })
  @Get()
  async findAll(): Promise<Content[]> {
    return await this.contentService.findAll();
  }

  @ApiOkResponse({ type: Content })
  @ApiOperation({
    description:
      'Create a content entry (image, file, video, etc.) and attach it to a message or post',
  })
  @Post()
  async create(@Body() dto: ContentCreateDto): Promise<Content> {
    return await this.contentService.create(dto);
  }

  @ApiOkResponse({ type: Content })
  @ApiOperation({ description: 'Remove a content item by Content ID' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Content> {
    return await this.contentService.remove(id);
  }
}
