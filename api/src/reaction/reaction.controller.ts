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
import { ReactionService } from './reaction.service';
import { ReactionCreateDto, ReactionResponseDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('reaction')
@ApiTags('Reaction')
@UseGuards(JwtAuthGuard)
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @ApiOkResponse({ type: [ReactionResponseDto] })
  @ApiOperation({
    description: 'Get all Reactions for a specific entity type and ID',
  })
  @Get()
  async findReactions(
    @Query('type') type: 'message' | 'post' | 'comment',
    @Query('id', ParseIntPipe) id: number,
  ): Promise<ReactionResponseDto[]> {
    return await this.reactionService.findReactionsForEntity(type, id);
  }

  @ApiOkResponse({ type: ReactionResponseDto })
  @ApiOperation({
    description: 'Create a Reaction for a Message, Post, or Comment',
  })
  @Post()
  async create(@Body() dto: ReactionCreateDto): Promise<ReactionResponseDto> {
    return await this.reactionService.create(dto);
  }

  @ApiOkResponse({ type: ReactionResponseDto })
  @ApiOperation({
    description: 'Delete a reaction by ID',
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<ReactionResponseDto> {
    const userId = req.user.id as number;
    return await this.reactionService.remove(id, userId);
  }
}
