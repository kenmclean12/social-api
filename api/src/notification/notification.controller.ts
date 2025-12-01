import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { NotificationCreateDto, NotificationUpdateDto } from './dto';

@Controller('notification')
@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOkResponse({ type: Notification, isArray: true })
  @ApiOperation({ summary: 'Get all notifications for the authenticated user' })
  @Get()
  async findAllForUser(@Req() req): Promise<Notification[]> {
    const userId = req.user.id as number;
    return await this.notificationService.findAllForUser(userId);
  }

  @ApiOkResponse({ type: Notification })
  @ApiBody({ type: NotificationCreateDto })
  @ApiOperation({ summary: 'Create a notification' })
  @Post()
  async create(@Body() dto: NotificationCreateDto): Promise<Notification> {
    return await this.notificationService.create(dto);
  }

  @ApiOkResponse({ type: Notification })
  @ApiBody({ type: NotificationUpdateDto })
  @ApiOperation({ summary: 'Mark a notification read/unread' })
  @Patch(':id')
  async markRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NotificationUpdateDto,
  ): Promise<Notification> {
    return await this.notificationService.markRead(id, dto);
  }

  @ApiOkResponse({ type: Notification })
  @ApiOperation({ summary: 'Delete a notification (only by recipient)' })
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<Notification> {
    const userId = req.user.id as number;
    return await this.notificationService.remove(id, userId);
  }
}
