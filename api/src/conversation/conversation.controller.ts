import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AlterParticipantsDto,
  ConversationCreateDto,
  ConversationUpdateDto,
  InitiateConversationDto,
  InitiateConversationResponseDto,
  ConversationResponseDto,
} from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('conversation')
@ApiTags('Conversation')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOkResponse({ type: ConversationResponseDto })
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConversationResponseDto> {
    return await this.conversationService.findOne(id);
  }

  @ApiOkResponse({ type: ConversationResponseDto, isArray: true })
  @ApiOperation({
    summary:
      'Get all conversations a particular user is involved in by User ID',
  })
  @Get('conversations/:id')
  async findByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ConversationResponseDto[]> {
    return await this.conversationService.findByUserId(id);
  }

  @ApiOkResponse({ type: ConversationResponseDto })
  @ApiOperation({
    summary: 'Leave a conversation by Conversation ID (removes current user)',
  })
  @Post('leave/:id')
  async leaveConversation(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<ConversationResponseDto> {
    const userId = req.user.id as number;
    return await this.conversationService.leaveConversation(id, userId);
  }

  @ApiOkResponse({ type: ConversationResponseDto })
  @ApiBody({ type: ConversationCreateDto })
  @ApiOperation({ summary: 'Create a Conversation' })
  @Post()
  async create(
    @Body() dto: ConversationCreateDto,
  ): Promise<ConversationResponseDto> {
    return await this.conversationService.create(dto);
  }

  @ApiOkResponse({ type: InitiateConversationResponseDto })
  @ApiBody({ type: InitiateConversationDto })
  @ApiOperation({ summary: 'Initiate a Conversation / Send the First Message' })
  @Post('initiate')
  async initiateConversation(
    @Body() dto: InitiateConversationDto,
  ): Promise<InitiateConversationResponseDto> {
    return await this.conversationService.initiateConversation(dto);
  }

  @ApiOkResponse({ type: ConversationResponseDto })
  @ApiBody({ type: AlterParticipantsDto })
  @ApiOperation({
    summary:
      'Add or remove participants from a Conversation by Conversation ID',
  })
  @Post('alter-participants/:id')
  async alterParticipants(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AlterParticipantsDto,
    @Req() req,
  ): Promise<ConversationResponseDto> {
    const userId = req.user.id as number;
    return await this.conversationService.alterParticipants(id, userId, dto);
  }

  @ApiOkResponse({ type: ConversationResponseDto })
  @ApiBody({ type: ConversationUpdateDto })
  @ApiOperation({ summary: 'Update Conversation Info by Conversation ID' })
  @Patch(':id')
  async update(
    @Body() dto: ConversationUpdateDto,
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<ConversationResponseDto> {
    const userId = req.user.id as number;
    return await this.conversationService.update(id, userId, dto);
  }

  @ApiOkResponse({ type: ConversationResponseDto })
  @ApiOperation({
    summary: 'Remove Conversation by Conversation ID',
  })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<ConversationResponseDto> {
    const userId = req.user.id as number;
    return await this.conversationService.remove(id, userId);
  }
}
