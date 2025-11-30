import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReactionService } from './reaction.service';
import { Reaction } from './entities/reaction.entity';
import { ReactionCreateDto } from './dto';

@Controller('reaction')
@ApiTags('Reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @ApiOkResponse({ type: [Reaction] })
  @ApiOperation({
    description: 'Get all Reactions for a specific entity type and ID',
  })
  @Get()
  async findReactions(
    @Query('type') type: 'message' | 'post' | 'comment',
    @Query('id', ParseIntPipe) id: number,
  ): Promise<Reaction[]> {
    return await this.reactionService.findReactionsForEntity(type, id);
  }

  @ApiOkResponse({ type: Reaction })
  @ApiOperation({
    description: 'Create a Reaction for a Message, Post, or Comment',
  })
  @Post()
  async create(@Body() dto: ReactionCreateDto): Promise<Reaction> {
    return await this.reactionService.create(dto);
  }

  @ApiOkResponse({ type: Reaction })
  @ApiOperation({ description: 'Remove a Reaction by ID' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Reaction> {
    return await this.reactionService.remove(id);
  }
}
