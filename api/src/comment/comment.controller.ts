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
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';
import { CommentCreateDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('comment')
@ApiTags('Comment')
@UseGuards(JwtAuthGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOkResponse({ type: Comment, isArray: true })
  @ApiOperation({
    description: 'Find comments for a particular Post by Post ID',
  })
  @Get(':postId')
  async findByPostId(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    return await this.commentService.findByPostId(postId);
  }

  @ApiOkResponse({ type: Comment })
  @ApiOperation({
    description: 'Create a Comment',
  })
  @Post()
  async create(@Body() dto: CommentCreateDto): Promise<Comment> {
    return await this.commentService.create(dto);
  }

  @ApiOkResponse({ type: Comment })
  @ApiOperation({
    description: 'Update a Comment by Comment ID',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Query('content') content: string,
  ): Promise<Comment> {
    const userId = req.user.id as number;
    return await this.commentService.update(id, userId, content);
  }

  @ApiOkResponse({ type: Comment })
  @ApiOperation({
    description: 'Remove a Comment',
  })
  @Delete(':id/:userId')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<Comment> {
    const userId = req.user.id as number;
    return await this.commentService.remove(id, userId);
  }
}
