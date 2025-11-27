import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';

@ApiTags('User')
@Controller('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Find a User by User ID' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.userService.findOne(id);
  }

  @ApiOkResponse({ type: User, isArray: true })
  @ApiOperation({ summary: 'Find all Users' })
  @Get()
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Create a User' })
  @Post()
  async create(@Body() dto: UserCreateDto): Promise<User> {
    return await this.userService.create(dto);
  }

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Update a Users Information' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UserUpdateDto,
  ): Promise<User> {
    return await this.userService.update(id, dto);
  }

  @ApiOkResponse({ type: User })
  @ApiOperation({ summary: 'Delete a User from the Database' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<User> {
    return await this.userService.delete(id);
  }
}
