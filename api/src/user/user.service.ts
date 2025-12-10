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
  UserCreateDto,
  UserResponseDto,
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
    if (!user) {
      throw new NotFoundException(`User not found with provided ID: ${id}`);
    }

    return user;
  }

  async findByIdsInternal(ids: number[]): Promise<User[]> {
    return await this.userRepo.find({ where: { id: In(ids) } });
  }

  async findOneByEmailInternal(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        `No user found with the provided email address: ${email}`,
      );
    }

    return user;
  }

  async findByTokenInternal(token: string): Promise<User | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;
      if (!userId) return null;
      return this.findOneInternal(userId as number);
    } catch {
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

    return convertToResponseDto(UserWithCountsResponseDto, {
      ...user,
      followingCount,
      followerCount,
    });
  }

  async searchUsers(query: string): Promise<UserResponseDto[]> {
    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.firstName ILIKE :q', { q: `${query}%` })
      .orWhere('user.lastName ILIKE :q', { q: `${query}%` })
      .orWhere('user.email ILIKE :q', { q: `${query}%` })
      .orWhere('user.userName ILIKE :q', { q: `${query}%` })
      .orderBy('user.firstName', 'ASC')
      .getMany();

    return users.map((u) => convertToResponseDto(UserResponseDto, u));
  }

  async createInternal(dto: UserCreateDto): Promise<User> {
    await this.assertUserFields({
      email: dto.email,
      userName: dto.userName,
      phoneNumber: dto.phoneNumber,
    });
    const { password, ...rest } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userToSave = {
      ...rest,
      hashedPassword,
    };

    return await this.userRepo.save(userToSave);
  }

  async create(dto: UserCreateDto): Promise<UserResponseDto> {
    await this.assertUserFields({
      email: dto.email,
      userName: dto.userName,
      phoneNumber: dto.phoneNumber,
    });

    const { password, ...rest } = dto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userToSave = {
      ...rest,
      hashedPassword,
    };

    const savedUser = await this.userRepo.save(userToSave);
    return convertToResponseDto(UserResponseDto, savedUser);
  }

  async update(id: number, dto: UserUpdateDto): Promise<UserResponseDto> {
    const existingUser = await this.findOneInternal(id);
    await this.assertUserFields({
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    const mergedUser = this.userRepo.merge(existingUser, dto);
    const savedUser = await this.userRepo.save(mergedUser);
    return convertToResponseDto(UserResponseDto, savedUser);
  }

  async delete(id: number): Promise<UserResponseDto> {
    const userToDelete = await this.findOneInternal(id);
    await this.userRepo.remove(userToDelete);
    return convertToResponseDto(UserResponseDto, userToDelete);
  }

  async resetPassword(
    userId: number,
    { oldPassword, newPassword }: PasswordResetDto,
  ): Promise<UserResponseDto> {
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
    return convertToResponseDto(UserResponseDto, savedUser);
  }

  async assertUserFields(fields: Partial<User>) {
    for (const [field, value] of Object.entries(fields)) {
      if (value) {
        await assertUnique(this.userRepo, field as keyof User, 'User', value);
      }
    }
  }
}
