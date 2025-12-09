import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostCreateDto, PostResponseDto, PostUpdateDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards';
import { PaginatedResponseDto } from 'src/utils';

@Controller('post')
@ApiTags('Post')
@UseGuards(JwtAuthGuard)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOkResponse({ type: PostResponseDto })
  @ApiOperation({
    description: 'Find a post by Post ID',
  })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PostResponseDto> {
    return await this.postService.findOne(id);
  }

  @ApiOkResponse({ type: PaginatedResponseDto<PostResponseDto> })
  @ApiOperation({
    description: 'Find paginated Posts for a particular user by User ID',
  })
  @Get('posts/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const { data, total } = await this.postService.findByUserId(
      userId,
      page,
      limit,
    );

    return {
      total,
      page,
      limit,
      data,
    };
  }

  @ApiOkResponse({ type: PostResponseDto })
  @ApiOperation({ description: 'Create a Post' })
  @Post()
  async create(@Body() dto: PostCreateDto): Promise<PostResponseDto> {
    return await this.postService.create(dto);
  }

  @ApiOkResponse({ type: PostResponseDto })
  @ApiOperation({ description: 'Update a Post by Post ID' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostUpdateDto,
    @Req() req,
  ): Promise<PostResponseDto> {
    const userId = req.user.id as number;
    return await this.postService.update(id, userId, dto);
  }

  @ApiOkResponse({ type: PostResponseDto })
  @ApiOperation({ description: 'Remove a Post by Post ID' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<PostResponseDto> {
    const userId = req.user.id as number;
    return await this.postService.remove(id, userId);
  }
}
