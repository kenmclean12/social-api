import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AlterParticipantsDto,
  ConversationCreateDto,
  ConversationRemoveDto,
  ConversationUpdateDto,
  InitiateConversationDto,
  InitiateConversationResponseDto,
  SafeConversationDto,
} from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('conversation')
@ApiTags('Conversation')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @ApiOkResponse({ type: SafeConversationDto })
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SafeConversationDto> {
    return await this.conversationService.findOne(id);
  }

  @ApiOkResponse({ type: SafeConversationDto, isArray: true })
  @ApiOperation({
    summary:
      'Get all conversations a particular user is involved in by User ID',
  })
  @Get('conversations/:id')
  async findByUserId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SafeConversationDto[]> {
    return await this.conversationService.findByUserId(id);
  }

  @ApiOkResponse({ type: SafeConversationDto })
  @ApiBody({ type: ConversationCreateDto })
  @ApiOperation({ summary: 'Create a Conversation' })
  @Post()
  async create(
    @Body() dto: ConversationCreateDto,
  ): Promise<SafeConversationDto> {
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

  @ApiOkResponse({ type: SafeConversationDto })
  @ApiBody({ type: AlterParticipantsDto })
  @ApiOperation({
    summary:
      'Add or remove participants from a Conversation by Conversation ID',
  })
  @Post('alter-participants/:id')
  async alterParticipants(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AlterParticipantsDto,
  ): Promise<SafeConversationDto> {
    return await this.conversationService.alterParticipants(id, dto);
  }

  @ApiOkResponse({ type: SafeConversationDto })
  @ApiBody({ type: ConversationUpdateDto })
  @ApiOperation({ summary: 'Update Conversation Info by Conversation ID' })
  @Patch(':id')
  async update(
    @Body() dto: ConversationUpdateDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SafeConversationDto> {
    return await this.conversationService.update(id, dto);
  }

  @ApiOkResponse({ type: SafeConversationDto })
  @ApiBody({ type: ConversationRemoveDto })
  @ApiOperation({
    summary: 'Remove Conversation by Conversation ID and Initiator User ID',
  })
  @Delete()
  async remove(
    @Body() dto: ConversationRemoveDto,
  ): Promise<SafeConversationDto> {
    return await this.conversationService.remove(dto);
  }
}
