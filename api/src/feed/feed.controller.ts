import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { PostResponseDto } from 'src/post/dto';

@Controller('feed')
@ApiTags('Feed')
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @ApiOkResponse({ type: PostResponseDto, isArray: true })
  @ApiOperation({ summary: 'Get personalized feed for a user' })
  @Get('personalized')
  async getPersonalizedFeed(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<PostResponseDto[]> {
    return await this.feedService.getPersonalizedFeed(userId, limit);
  }

  @ApiOkResponse({ type: PostResponseDto, isArray: true })
  @ApiOperation({
    summary:
      'Get explore feed (mostLiked, mostReacted, recent, oldest). Defaults to recent',
  })
  @Get('explore')
  async getExploreFeed(
    @Query('filter', new DefaultValuePipe('recent'))
    filter: 'mostLiked' | 'mostReacted' | 'recent' | 'oldest',
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<PostResponseDto[]> {
    return await this.feedService.getExploreFeed(filter, limit);
  }
}
