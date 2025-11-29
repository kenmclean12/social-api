import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';
import * as bcrypt from 'bcrypt';
import { PasswordResetDto } from './dto/password-reset.dto';
import { assertUnique } from 'src/common/utils';

export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findOneWithRelations(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['followers', 'following'],
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
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
    await this.userRepo.remove(userToDelete);
    return userToDelete;
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

  async checkPasswords(
    password?: string,
    existingPassword?: string,
  ): Promise<boolean> {
    if (!password || !existingPassword) {
      throw new Error('Passwords not provided for comparison');
    }

    return !(await bcrypt.compare(password, existingPassword));
  }
}
