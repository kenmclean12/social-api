/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { assertUnique } from 'src/common/utils';
import {
  PasswordResetDto,
  SafeUserDto,
  UserCreateDto,
  UserUpdateDto,
  UserWithCountsResponseDto,
} from './dto';
import { JwtService } from '@nestjs/jwt';
import { Follow } from 'src/follow/entities/follow.entity';
import { convertToResponseDto } from 'src/common/utils/convert-to-response-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    private readonly jwtService: JwtService,
  ) {}

  async findOneInternal(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findByIdsInternal(ids: number[]): Promise<User[]> {
    const users = await this.userRepo.find({
      where: { id: In(ids) },
    });

    if (users.length === 0) {
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

  async findByTokenInternal(token: string): Promise<User | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      if (!userId) return null;

      return this.findOneInternal(userId as number);
    } catch (e) {
      return null;
    }
  }

  async findOneWithFollowCounts(
    id: number,
  ): Promise<UserWithCountsResponseDto> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);

    const followingCount = await this.followRepo.count({
      where: { follower: { id } },
    });

    const followerCount = await this.followRepo.count({
      where: { following: { id } },
    });

    const safeUser = convertToResponseDto(UserWithCountsResponseDto, user);
    safeUser.followingCount = followingCount;
    safeUser.followerCount = followerCount;

    return safeUser;
  }

  async findAll(): Promise<SafeUserDto[]> {
    const users = await this.userRepo.find({ order: { createdAt: 'ASC' } });

    const resultSet = new Set<SafeUserDto>();
    for (const user of users) {
      resultSet.add(convertToResponseDto(SafeUserDto, user));
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

    return convertToResponseDto(SafeUserDto, savedUser);
  }

  async createInternal(dto: UserCreateDto): Promise<User> {
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

    return savedUser;
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

    return convertToResponseDto(SafeUserDto, savedUser);
  }

  async delete(id: number): Promise<SafeUserDto> {
    const userToDelete = await this.findOneInternal(id);
    await this.userRepo.remove(userToDelete);

    return convertToResponseDto(SafeUserDto, userToDelete);
  }

  async resetPassword(
    userId: number,
    { oldPassword, newPassword }: PasswordResetDto,
  ): Promise<SafeUserDto> {
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

    return convertToResponseDto(SafeUserDto, savedUser);
  }

  async assertUserFields(fields: Partial<User>) {
    for (const [field, value] of Object.entries(fields)) {
      if (value) {
        await assertUnique(this.userRepo, field as keyof User, 'User', value);
      }
    }
  }
}
