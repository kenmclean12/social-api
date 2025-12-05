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
import { MessageService } from './message.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  MessageCreateDto,
  MessageReadResponseDto,
  MessageResponseDto,
  MessageUpdateDto,
} from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('message')
@ApiTags('Message')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOkResponse({ type: MessageResponseDto })
  @ApiOperation({ description: 'Get a message by message ID' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MessageResponseDto> {
    return await this.messageService.findOne(id);
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @ApiOperation({ description: 'Get a message by Conversation ID' })
  @Get('conversation/:id')
  async findByConversationId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<MessageResponseDto[]> {
    return await this.messageService.findByConversationId(id);
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @ApiOperation({ description: 'Create a message' })
  @Post()
  async create(@Body() dto: MessageCreateDto): Promise<MessageResponseDto> {
    return await this.messageService.create(dto);
  }

  @ApiOkResponse({ type: MessageReadResponseDto })
  @ApiOperation({ description: 'Mark a message as read' })
  @Post(':id/read/:userId')
  async markMessageRead(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<MessageReadResponseDto> {
    return await this.messageService.markMessageRead(id, userId);
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @ApiOperation({ description: 'Update message content by message ID' })
  @Patch(':id')
  async update(
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MessageUpdateDto,
  ): Promise<MessageResponseDto> {
    const userId = req.user.id as number;
    return await this.messageService.update(id, userId, dto);
  }

  @ApiOkResponse({ type: MessageResponseDto })
  @ApiOperation({ description: 'Remove a message by message ID' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<MessageResponseDto> {
    const userId = req.user.id as number;
    return await this.messageService.remove(id, userId);
  }
}
