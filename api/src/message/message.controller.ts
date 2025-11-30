import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MessageService } from './message.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from './entities/message.entity';
import { MessageCreateDto } from './dto/message-create.dto';
import { MessageUpdateDto } from './dto/message-update.dto';

@Controller('message')
@ApiTags('Message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Get a message by message ID' })
  @ApiProperty()
  @Get('id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return await this.messageService.findOne(id);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Get a message by message ID' })
  @ApiProperty()
  @Get('conversation/:id')
  async findByConversationId(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Message[]> {
    return await this.messageService.findByConversationId(id);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Get a message by message ID' })
  @ApiProperty()
  @Post()
  async create(@Body() dto: MessageCreateDto): Promise<Message> {
    return await this.messageService.create(dto);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Update message content by message ID' })
  @ApiProperty()
  @Patch()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MessageUpdateDto,
  ): Promise<Message> {
    return await this.messageService.update(id, dto);
  }

  @ApiOkResponse({ type: Message })
  @ApiOperation({ description: 'Delete a message by message ID' })
  @ApiProperty()
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Message> {
    return await this.messageService.remove(id);
  }
}
