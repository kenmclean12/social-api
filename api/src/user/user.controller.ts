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
import {
  PasswordResetDto,
  SafeUserDto,
  UserCreateDto,
  UserUpdateDto,
  UserWithCountsResponseDto,
} from './dto';

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

  @ApiOkResponse({ type: SafeUserDto, isArray: true })
  @ApiOperation({ summary: 'Find all Users' })
  @Get()
  async findAll(): Promise<SafeUserDto[]> {
    return await this.userService.findAll();
  }

  @ApiOkResponse({ type: SafeUserDto })
  @ApiBody({ type: UserCreateDto })
  @ApiOperation({ summary: 'Create a User' })
  @Post()
  async create(@Body() dto: UserCreateDto): Promise<SafeUserDto> {
    return await this.userService.create(dto);
  }

  @ApiOkResponse({ type: SafeUserDto })
  @ApiBody({ type: UserUpdateDto })
  @ApiOperation({ summary: 'Update a Users Information' })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UserUpdateDto,
  ): Promise<SafeUserDto> {
    return await this.userService.update(id, dto);
  }

  @ApiOkResponse({ type: SafeUserDto })
  @ApiOperation({ summary: 'Delete a User from the Database' })
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<SafeUserDto> {
    return await this.userService.delete(id);
  }

  @ApiOkResponse({ type: User })
  @ApiBody({ type: PasswordResetDto })
  @ApiOperation({ summary: 'Reset a Users Password' })
  @Post('reset-password')
  async resetPassword(@Body() dto: PasswordResetDto): Promise<SafeUserDto> {
    return await this.userService.resetPassword(dto);
  }
}
