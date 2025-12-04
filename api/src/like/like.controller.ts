import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LikeService } from './like.service';
import { LikeCreateDto, LikeResponseDto } from './dto';
import { EntityType } from 'src/common/types';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('like')
@ApiTags('Like')
@UseGuards(JwtAuthGuard)
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOkResponse({ type: [LikeResponseDto] })
  @ApiOperation({
    description: 'Get all likes for a specific entity type and ID',
  })
  @Get()
  async findLikes(
    @Query('type') type: EntityType,
    @Query('id', ParseIntPipe) id: number,
  ): Promise<LikeResponseDto[]> {
    return await this.likeService.findLikesForEntity(type, id);
  }

  @ApiOkResponse({ type: LikeResponseDto })
  @ApiOperation({
    description: 'Create a like for a message, post, or comment',
  })
  @Post()
  async create(@Body() dto: LikeCreateDto): Promise<LikeResponseDto> {
    return await this.likeService.create(dto);
  }

  @ApiOkResponse({ type: LikeResponseDto })
  @ApiOperation({ description: 'Delete a like by ID' })
  @Delete(':id')
  async delete(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<LikeResponseDto> {
    const userId = req.user.id as number;
    return await this.likeService.delete(id, userId);
  }
}
