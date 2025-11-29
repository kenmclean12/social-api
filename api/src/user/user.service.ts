import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import * as bcrypt from 'bcrypt';
import { PasswordResetDto } from './dto/password-reset.dto';
import { assertUnique } from 'src/common/utils';
import { FollowService } from 'src/follow/follow.service';
import { UserWithCountsResponseDto } from './dto/user-with-counts-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => FollowService))
    private readonly followService: FollowService,
  ) {}

  async findOne(id: number): Promise<User> {
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

    const result: UserWithCountsResponseDto = {
      ...user,
      followingCount: following.length,
      followerCount: followers.length,
    };

    return result;
  }

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with Email: ${email} not found`);
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  async create(dto: UserCreateDto): Promise<User> {
    await this.assertUserFields({
      email: dto.email,
      userName: dto.userName,
      phoneNumber: dto.phoneNumber,
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const userToSave = {
      ...dto,
      hashedPassword,
    };

    return await this.userRepo.save(userToSave);
  }

  async update(id: number, dto: UserUpdateDto): Promise<User> {
    const existingUser = await this.findOne(id);
    await this.assertUserFields({
      email: dto.email,
      phoneNumber: dto.phoneNumber,
    });

    const mergedUser = this.userRepo.merge(existingUser, dto);
    return await this.userRepo.save(mergedUser);
  }

  async delete(id: number): Promise<User> {
    const userToDelete = await this.findOne(id);
    return this.userRepo.remove(userToDelete);
  }

  async resetPassword({
    userId,
    oldPassword,
    newPassword,
  }: PasswordResetDto): Promise<User> {
    const existingUser = await this.findOne(userId);

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

    return await this.userRepo.save(existingUser);
  }

  async assertUserFields(fields: Partial<User>) {
    for (const [field, value] of Object.entries(fields)) {
      if (value) {
        await assertUnique(this.userRepo, field as keyof User, 'User', value);
      }
    }
  }
}
