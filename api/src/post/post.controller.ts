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
} from '@nestjs/common';
import { PostCreateDto, PostUpdateDto } from './dto';
import { UserPost } from './entities/user-post.entity';

@Controller('post')
@ApiTags('Post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOkResponse({ type: UserPost })
  @ApiOperation({ description: 'Find a Post by Post ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserPost> {
    return await this.postService.findOne(id);
  }

  @ApiOkResponse({ type: UserPost, isArray: true })
  @ApiOperation({
    description: 'Find all Posts for a particular user by User ID',
  })
  @Get('posts/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe) id: number,
  ): Promise<UserPost[]> {
    return await this.postService.findByUserId(id);
  }

  @ApiOkResponse({ type: UserPost, isArray: true })
  @ApiOperation({ description: 'Find all Posts' })
  @Get()
  async findAll(): Promise<UserPost[]> {
    return await this.postService.findAll();
  }

  @ApiOkResponse({ type: UserPost })
  @ApiOperation({ description: 'Create a Post' })
  @Post()
  async create(@Body() dto: PostCreateDto): Promise<UserPost> {
    return await this.postService.create(dto);
  }

  @ApiOkResponse({ type: UserPost })
  @ApiOperation({ description: 'Update a Post by Post ID' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PostUpdateDto,
  ): Promise<UserPost> {
    return await this.postService.update(id, dto);
  }

  @ApiOkResponse({ type: UserPost })
  @ApiOperation({ description: 'Remove a Post by Post ID' })
  @Delete(':id/:userId')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<UserPost> {
    return await this.postService.remove(id, userId);
  }
}
