import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Reaction } from './entities/reaction.entity';
import { ReactionService } from './reaction.service';
import { ReactionCreateDto } from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('reaction')
@ApiTags('Reaction')
@UseGuards(JwtAuthGuard)
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
}
