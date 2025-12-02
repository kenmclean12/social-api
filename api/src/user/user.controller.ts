import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
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
  SafeUserDto,
  UserUpdateDto,
  UserWithCountsResponseDto,
} from './dto';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('user')
@ApiTags('User')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Find a User by User ID' })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithCountsResponseDto> {
    return await this.userService.findOneWithFollowCounts(id);
  }

  @ApiOkResponse({ type: SafeUserDto, isArray: true })
  @ApiOperation({ summary: 'Find all Users' })
  @Get()
  async findAll(): Promise<SafeUserDto[]> {
    return await this.userService.findAll();
  }

  @ApiOkResponse({ type: SafeUserDto })
  @ApiBody({ type: UserUpdateDto })
  @ApiOperation({ summary: 'Update a Users Information' })
  @Patch(':id')
  async update(@Req() req, @Body() dto: UserUpdateDto): Promise<SafeUserDto> {
    const id = req.user.id as number;
    return await this.userService.update(id, dto);
  }

  @ApiOkResponse({ type: SafeUserDto })
  @ApiOperation({ summary: 'Delete a User from the Database' })
  @Delete('self')
  async delete(@Req() req): Promise<SafeUserDto> {
    const id = req.user.id as number;
    return await this.userService.delete(id);
  }

  @ApiOkResponse({ type: User })
  @ApiBody({ type: PasswordResetDto })
  @ApiOperation({ summary: 'Reset a Users Password' })
  @Post('reset-password')
  async resetPassword(
    @Req() req,
    @Body() dto: PasswordResetDto,
  ): Promise<SafeUserDto> {
    const userId = req.user.id as number;
    return await this.userService.resetPassword(userId, dto);
  }
}
