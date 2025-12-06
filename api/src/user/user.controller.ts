import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
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
import {
  PasswordResetDto,
  UserResponseDto,
  UserUpdateDto,
  UserWithCountsResponseDto,
} from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('user')
@ApiTags('User')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: UserWithCountsResponseDto })
  @ApiOperation({ summary: 'Find a user by user ID' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithCountsResponseDto> {
    return await this.userService.findOneWithFollowCounts(id);
  }

  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  @ApiOperation({ summary: 'Find all users' })
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return await this.userService.findAll();
  }

  @ApiOkResponse({ type: UserResponseDto })
  @ApiBody({ type: UserUpdateDto })
  @ApiOperation({ summary: 'Update user information by user ID' })
  @Patch(':id')
  async update(
    @Req() req,
    @Body() dto: UserUpdateDto,
  ): Promise<UserResponseDto> {
    const id = req.user.id as number;
    return await this.userService.update(id, dto);
  }

  @ApiOkResponse({ type: UserResponseDto })
  @ApiOperation({ summary: 'Delete your own user' })
  @Delete('self')
  async delete(@Req() req): Promise<UserResponseDto> {
    const id = req.user.id as number;
    return await this.userService.delete(id);
  }

  @ApiOkResponse({ type: UserResponseDto })
  @ApiBody({ type: PasswordResetDto })
  @ApiOperation({ summary: 'Reset user password' })
  @Post('reset-password')
  async resetPassword(
    @Req() req,
    @Body() dto: PasswordResetDto,
  ): Promise<UserResponseDto> {
    const userId = req.user.id as number;
    return await this.userService.resetPassword(userId, dto);
  }
}
