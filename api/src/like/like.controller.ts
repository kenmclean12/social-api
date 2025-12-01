import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { LikeCreateDto } from './dto';
import { EntityType } from 'src/common/types';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('like')
@ApiTags('Like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOkResponse({ type: [Like] })
  @ApiOperation({
    description: 'Get all likes for a specific entity type and ID',
  })
  @Get()
  async findLikes(
    @Query('type') type: EntityType,
    @Query('id', ParseIntPipe) id: number,
  ): Promise<Like[]> {
    return await this.likeService.findLikesForEntity(type, id);
  }

  @ApiOkResponse({ type: Like })
  @ApiOperation({
    description: 'Create a like for a message, post, or comment',
  })
  @Post()
  async create(@Body() dto: LikeCreateDto): Promise<Like> {
    return await this.likeService.create(dto);
  }

  @ApiOkResponse({ type: String })
  @ApiOperation({ description: 'Delete a like by ID' })
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.likeService.delete(id);
    return { message: `Like with ID ${id} deleted successfully` };
  }
}
