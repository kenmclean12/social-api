import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Conversation } from './entities/conversation.entity';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOkResponse({ type: Conversation })
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Conversation>  {
    return await this.conversationService.findOne(id);
  }

  @ApiOkResponse({ type: Conversation })
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Conversation>  {
    return await this.conversationService.findOne(id);
  }

  @Post()
  
}
