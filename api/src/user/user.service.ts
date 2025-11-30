/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import * as bcrypt from 'bcrypt';
import { PasswordResetDto } from './dto/password-reset.dto';
import { assertUnique } from 'src/common/utils';
import { FollowService } from 'src/follow/follow.service';
import { UserWithCountsResponseDto } from './dto/user-with-counts-response.dto';
import { plainToInstance } from 'class-transformer';
import { SafeUserDto } from './dto/safe-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => FollowService))
    private readonly followService: FollowService,
  ) {}

  async findOneInternal(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findOneWithFollowCounts(
    id: number,
  ): Promise<UserWithCountsResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    const following =
      (await this.followService.findFollowingByUserId(id)) || [];
    const followers =
      (await this.followService.findFollowersByUserId(id)) || [];

    const safeUser = plainToInstance(UserWithCountsResponseDto, user, {
      excludeExtraneousValues: true,
    }) as UserWithCountsResponseDto;

    safeUser.followingCount = following.length;
    safeUser.followerCount = followers.length;

    return safeUser;
  }

  async findByIds(ids: number[]): Promise<User[]> {
    const users = await this.userRepo.find({
      where: { id: In(ids) },
    });

    if (!users) {
      throw new NotFoundException(
        'Could not fetch users with provided ID Array',
      );
    }

    return users;
  }

  async findOneByEmailInternal(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with Email: ${email} not found`);
    }

    return user;
  }

  async findAll(): Promise<SafeUserDto[]> {
    const users = await this.userRepo.find();
    if (!users) {
      throw new Error('Failed to fetch all Users from the database');
    }

    const resultSet = new Set<SafeUserDto>();
    for (const user of users) {
      const safeUser = plainToInstance(SafeUserDto, user, {
        excludeExtraneousValues: true,
      }) as SafeUserDto;
      resultSet.add(safeUser);
    }

    return Array.from(resultSet);
  }

  async create(dto: UserCreateDto): Promise<SafeUserDto> {
    await this.assertUserFields({
      email: dto.email,
      userName: dto.userName,
      phoneNumber: dto.phoneNumber,
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { password, ...rest } = dto;
    const userToSave = {
      ...rest,
      hashedPassword,
    };

    const savedUser = await this.userRepo.save(userToSave);
    if (!savedUser) {
      throw new Error(
        `Could not save User with provided data: ${JSON.stringify(userToSave)}`,
      );
    }

    return plainToInstance(SafeUserDto, savedUser, {
      excludeExtraneousValues: true,
    }) as SafeUserDto;
  }

  async update(id: number, dto: UserUpdateDto): Promise<SafeUserDto> {
    const existingUser = await this.findOneInternal(id);
    await this.assertUserFields({
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    const mergedUser = this.userRepo.merge(existingUser, dto);
    const savedUser = await this.userRepo.save(mergedUser);
    if (!savedUser) {
      throw new Error(
        `Could not Update User with provided merged data: ${JSON.stringify(mergedUser)}`,
      );
    }

    return plainToInstance(SafeUserDto, savedUser, {
      excludeExtraneousValues: true,
    }) as SafeUserDto;
  }

  async delete(id: number): Promise<SafeUserDto> {
    const userToDelete = await this.findOneInternal(id);
    await this.userRepo.remove(userToDelete);

    return plainToInstance(SafeUserDto, userToDelete, {
      excludeExtraneousValues: true,
    }) as SafeUserDto;
  }

  async resetPassword({
    userId,
    oldPassword,
    newPassword,
  }: PasswordResetDto): Promise<SafeUserDto> {
    const existingUser = await this.findOneInternal(userId);

    const passwordMatching = await bcrypt.compare(
      oldPassword,
      existingUser.hashedPassword,
    );

    if (!passwordMatching) {
      throw new BadRequestException(
        `Old password provided does not match existing password for user ID ${userId}`,
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    existingUser.hashedPassword = hashedNewPassword;

    const savedUser = await this.userRepo.save(existingUser);
    if (!savedUser) {
      throw new Error(
        `Could not Save User when updating password with provided data: ${JSON.stringify(existingUser)}`,
      );
    }

    return plainToInstance(SafeUserDto, savedUser, {
      excludeExtraneousValues: true,
    }) as SafeUserDto;
  }

  async assertUserFields(fields: Partial<User>) {
    for (const [field, value] of Object.entries(fields)) {
      if (value) {
        await assertUnique(this.userRepo, field as keyof User, 'User', value);
      }
    }
  }
}
