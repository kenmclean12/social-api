import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { PostResponseDto } from 'src/post/dto';
import { PaginatedResponseDto } from 'src/utils';

@Controller('feed')
@ApiTags('Feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOperation({
    summary: 'Get personalized feed for a user (paginated)',
    description:
      'Returns posts from users you follow, and fills remaining space with random posts. Supports infinite scrolling.',
  })
  @ApiOkResponse({
    type: PaginatedResponseDto<PostResponseDto>,
  })
  @Get('personalized')
  async getPersonalizedFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Req() req,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const userId = req.user?.id as number;
    return await this.feedService.getPersonalizedFeed(userId, page, limit);
  }

  @ApiOperation({
    summary: 'Get explore feed (paginated)',
    description:
      'Explore feed allows sorting by: mostLiked, mostReacted, recent, oldest. Defaults to recent. Supports infinite scrolling.',
  })
  @ApiOkResponse({
    type: PaginatedResponseDto<PostResponseDto>,
  })
  @Get('explore')
  async getExploreFeed(
    @Query('filter', new DefaultValuePipe('recent'))
    filter: 'mostLiked' | 'mostReacted' | 'recent' | 'oldest',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    return await this.feedService.getExploreFeed(filter, page, limit);
  }
}
