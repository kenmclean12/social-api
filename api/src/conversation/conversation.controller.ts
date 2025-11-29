import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ApiBody, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Conversation } from './entities/conversation.entity';
import { ConversationCreateDto } from './dto/conversation.create.dto';
import { ConversationUpdateDto } from './dto/conversation-update.dto';
import { ConversationRemoveDto } from './dto/conversation-remove.dto';
import { AlterParticipantsDto } from './dto/add-participant.dto';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOkResponse({ type: Conversation })
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Conversation> {
    return await this.conversationService.findOne(id);
  }

  @ApiOkResponse({ type: Conversation, isArray: true })
  @ApiOperation({
    summary:
      'Get all conversations a particular user is involved in by User ID',
  })
  @Get('conversations/:id')
  async findByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Conversation[]> {
    return await this.conversationService.findByUserId(id);
  }

  @ApiOkResponse({ type: Conversation })
  @ApiBody({ type: ConversationCreateDto })
  @ApiOperation({ summary: 'Create a Conversation' })
  @Post()
  async create(@Body() dto: ConversationCreateDto): Promise<Conversation> {
    return await this.conversationService.create(dto);
  }

  @ApiOkResponse({ type: Conversation })
  @ApiBody({ type: ConversationCreateDto })
  @ApiOperation({
    summary: 'Add participants to a Conversation by Conversation ID',
  })
  @Post('add-participants/:id')
  async addParticipants(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AlterParticipantsDto,
  ): Promise<Conversation> {
    return await this.conversationService.alterParticipants(id, dto);
  }

  @ApiOkResponse({ type: Conversation })
  @ApiBody({ type: ConversationCreateDto })
  @ApiOperation({
    summary: 'Remove participants from a Conversation by Conversation ID',
  })
  @Post('remove-participants/:id')
  async removeParticipants(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AlterParticipantsDto,
  ): Promise<Conversation> {
    return await this.conversationService.alterParticipants(id, dto);
  }

  @ApiOkResponse({ type: Conversation })
  @ApiBody({ type: ConversationUpdateDto })
  @ApiOperation({ summary: 'Update Conversation Info by Conversation ID' })
  @Patch(':id')
  async update(
    @Body() dto: ConversationUpdateDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Conversation> {
    return await this.conversationService.update(id, dto);
  }

  @ApiOkResponse({ type: Conversation })
  @ApiBody({ type: ConversationRemoveDto })
  @ApiOperation({
    summary: 'Remove Conversation by Conversation ID and Initiator User ID',
  })
  @Delete()
  async remove(@Body() dto: ConversationRemoveDto): Promise<Conversation> {
    return await this.conversationService.remove(dto);
  }
}
