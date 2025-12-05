import {
  Controller,
  Get,
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
import { NotificationResponseDto, NotificationUpdateDto } from './dto';

@Controller('notification')
@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOkResponse({ type: NotificationResponseDto, isArray: true })
  @ApiOperation({ summary: 'Get all notifications for the authenticated user' })
  @Get()
  async findAllForUser(@Req() req): Promise<NotificationResponseDto[]> {
    const userId = req.user.id as number;
    return await this.notificationService.findAllForUser(userId);
  }

  @ApiOkResponse({ type: NotificationResponseDto })
  @ApiBody({ type: NotificationUpdateDto })
  @ApiOperation({ summary: 'Mark a notification read/unread' })
  @Patch(':id')
  async markRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NotificationUpdateDto,
  ): Promise<NotificationResponseDto> {
    return await this.notificationService.markRead(id, dto);
  }
}
