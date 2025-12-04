import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { FollowDto, FollowResponseDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('follow')
@ApiTags('Follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOkResponse({ type: FollowResponseDto, isArray: true })
  @ApiOperation({
    summary: 'Find All Following Records for a Particular User by User ID',
  })
  @Get(':id/following')
  async findFollowingByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FollowResponseDto[]> {
    return await this.followService.findFollowingByUserId(id);
  }

  @ApiOkResponse({ type: FollowResponseDto, isArray: true })
  @ApiOperation({
    summary: 'Find All Followers for a Particular User by User ID',
  })
  @Get(':id/followers')
  async findFollowersByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FollowResponseDto[]> {
    return await this.followService.findFollowersByUserId(id);
  }

  @ApiOkResponse({ type: FollowResponseDto })
  @ApiBody({ type: FollowDto })
  @ApiOperation({
    summary: 'Create a Follow Record Between Follower/Following User ID',
  })
  @Post('create')
  async create(@Body() dto: FollowDto): Promise<FollowResponseDto> {
    return await this.followService.create(dto);
  }

  @ApiOkResponse({ type: FollowResponseDto })
  @ApiOperation({
    summary: 'Remove a Follow Record by ID',
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<FollowResponseDto> {
    const userId = req.user.id as number;
    return await this.followService.remove(id, userId);
  }
}
