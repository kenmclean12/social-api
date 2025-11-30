import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { FollowDto } from './dto/follow.dto';
import { SafeFollowDto } from './dto/safe-follow.dto';

@Controller('follow')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOkResponse({ type: SafeFollowDto })
  @ApiOperation({
    summary: 'Find a Follow Record by ID',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SafeFollowDto> {
    return await this.followService.findOneWithRelations(id);
  }

  @ApiOkResponse({ type: SafeFollowDto, isArray: true })
  @ApiOperation({
    summary: 'Find All Following Records for a Particular User by User ID',
  })
  @Get(':id/following')
  async findFollowingByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SafeFollowDto[]> {
    return await this.followService.findFollowingByUserId(id);
  }

  @ApiOkResponse({ type: SafeFollowDto, isArray: true })
  @ApiOperation({
    summary: 'Find All Followers for a Particular User by User ID',
  })
  @Get(':id/followers')
  async findFollowersByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SafeFollowDto[]> {
    return await this.followService.findFollowersByUserId(id);
  }

  @ApiOkResponse({ type: SafeFollowDto })
  @ApiBody({ type: FollowDto })
  @ApiOperation({
    summary: 'Create a Follow Record Between Follower/Following User ID',
  })
  @Post('create')
  async create(@Body() dto: FollowDto): Promise<SafeFollowDto> {
    return await this.followService.create(dto);
  }

  @ApiOkResponse({ type: SafeFollowDto })
  @ApiOperation({
    summary: 'Remove a Follow Record by ID',
  })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SafeFollowDto> {
    return await this.followService.remove(id);
  }
}
