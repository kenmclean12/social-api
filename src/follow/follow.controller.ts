import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { FollowDto } from './dto/follow.dto';
import { Follow } from './entities/follow.entity';

@Controller('follow')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOkResponse({ type: Follow })
  @ApiBody({ type: FollowDto })
  @ApiOperation({
    summary: 'Find a Follow Record by Follower/Following User ID',
  })
  @Get('find')
  async findFollow(@Body() dto: FollowDto): Promise<Follow> {
    return await this.followService.findFollow(dto);
  }

  @ApiOkResponse({ type: Follow })
  @ApiBody({ type: FollowDto })
  @ApiOperation({
    summary: 'Create a Follow Record between Follower/Following User ID',
  })
  @Post('create')
  async createFollow(@Body() dto: FollowDto): Promise<Follow> {
    return await this.followService.createFollow(dto);
  }

  @ApiOkResponse({ type: Follow })
  @ApiBody({ type: FollowDto })
  @ApiOperation({
    summary: 'Remove a Follow Record by Follower/Following User ID',
  })
  @Post('remove')
  async removeFollow(@Body() dto: FollowDto): Promise<Follow> {
    return await this.followService.removeFollow(dto);
  }
}
