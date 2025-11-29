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
import { Follow } from './entities/follow.entity';

@Controller('follow')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOkResponse({ type: Follow })
  @ApiOperation({
    summary: 'Find a Follow Record by ID',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Follow> {
    return await this.followService.findOne(id);
  }

  @ApiOkResponse({ type: Follow })
  @ApiBody({ type: FollowDto })
  @ApiOperation({
    summary: 'Create a Follow Record between Follower/Following User ID',
  })
  @Post('create')
  async create(@Body() dto: FollowDto): Promise<Follow> {
    return await this.followService.create(dto);
  }

  @ApiOkResponse({ type: Follow })
  @ApiBody({ type: FollowDto })
  @ApiOperation({
    summary: 'Remove a Follow Record by ID',
  })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Follow> {
    return await this.followService.remove(id);
  }
}
