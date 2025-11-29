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
} from '@nestjs/common';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import { PasswordResetDto } from './dto/password-reset.dto';
import { UserWithCountsResponseDto } from './dto/user-with-counts-response.dto';

@Controller('user')
@ApiTags('User')
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

  @ApiOkResponse({ type: User, isArray: true })
  @ApiOperation({ summary: 'Find Users with Array of User IDs' })
  @Post('by-ids')
  async findByIds(@Body() ids: number[]): Promise<User[]> {
    return await this.userService.findByIds(ids);
  }

  @ApiOkResponse({ type: User, isArray: true })
  @ApiOperation({ summary: 'Find all Users' })
  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @ApiOkResponse({ type: User })
  @ApiBody({ type: UserCreateDto })
  @ApiOperation({ summary: 'Create a User' })
  @Post()
  async create(@Body() dto: UserCreateDto): Promise<User> {
    return await this.userService.create(dto);
  }

  @ApiOkResponse({ type: User })
  @ApiBody({ type: UserUpdateDto })
  @ApiOperation({ summary: 'Update a Users Information' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UserUpdateDto,
  ): Promise<User> {
    return await this.userService.update(id, dto);
  }

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Delete a User from the Database' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.delete(id);
  }

  @ApiOkResponse({ type: User })
  @ApiBody({ type: PasswordResetDto })
  @ApiOperation({ summary: 'Reset a Users Password' })
  @Post('reset-password')
  async resetPassword(@Body() dto: PasswordResetDto): Promise<User> {
    return await this.userService.resetPassword(dto);
  }
}
