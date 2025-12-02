import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards';
import { NotificationService } from './notification.service';
import { NotificationCreateDto, NotificationUpdateDto } from './dto';
import { SafeNotificationDto } from './dto/safe-notification.dto';

@Controller('notification')
@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOkResponse({ type: SafeNotificationDto, isArray: true })
  @ApiOperation({ summary: 'Get all notifications for the authenticated user' })
  @Get()
  async findAllForUser(@Req() req): Promise<SafeNotificationDto[]> {
    const userId = req.user.id as number;
    return await this.notificationService.findAllForUser(userId);
  }

  @ApiOkResponse({ type: SafeNotificationDto })
  @ApiBody({ type: NotificationCreateDto })
  @ApiOperation({ summary: 'Create a notification' })
  @Post()
  async create(
    @Body() dto: NotificationCreateDto,
  ): Promise<SafeNotificationDto> {
    return await this.notificationService.create(dto);
  }

  @ApiOkResponse({ type: SafeNotificationDto })
  @ApiBody({ type: NotificationUpdateDto })
  @ApiOperation({ summary: 'Mark a notification read/unread' })
  @Patch(':id')
  async markRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NotificationUpdateDto,
  ): Promise<SafeNotificationDto> {
    return await this.notificationService.markRead(id, dto);
  }
}
