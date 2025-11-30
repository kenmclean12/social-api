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
import { MessageService } from './message.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Message, MessageRead } from './entities';
import { MessageCreateDto, MessageUpdateDto } from './dto';

@Controller('message')
@ApiTags('Message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Get a message by message ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return await this.messageService.findOne(id);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Get a message by Conversation ID' })
  @Get('conversation/:id')
  async findByConversationId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Message[]> {
    return await this.messageService.findByConversationId(id);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Create a message' })
  @Post()
  async create(@Body() dto: MessageCreateDto): Promise<Message> {
    return await this.messageService.create(dto);
  }

  @ApiOkResponse({ type: MessageRead })
  @ApiOperation({ description: 'Mark a message as read' })
  @Post('read')
  async markMessageRead(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<MessageRead> {
    return await this.messageService.markMessageRead(id, userId);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Update message content by message ID' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MessageUpdateDto,
  ): Promise<Message> {
    return await this.messageService.update(id, dto);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Remove a message by message ID' })
  @Delete(':id/:userId')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Message> {
    return await this.messageService.remove(id, userId);
  }
}
