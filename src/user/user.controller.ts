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
import { UserSafeResponseDto } from './dto/user-safe-response.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Find a User by User ID' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Find a User with Relations Included by User ID' })
  @Get(':id/with-relations')
  async findOneWithRelations(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserSafeResponseDto> {
    return await this.userService.findOneWithRelations(id);
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
