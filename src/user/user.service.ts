/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCreateDto } from './dto/user.create.dto';
import { UserUpdateDto } from './dto/user.update.dto';

@Injectable()
export class UserService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: Number(id) } });
    if (!user) {
      this.logger.error(`Error, User with ID ${id} not found`);
      throw new NotFoundException(`Error, User with ID ${id} not found`);
    }

    return user;
  }

  async findAll(): Promise<User[]> {
    const allUsers = await this.userRepo.find();
    if (!allUsers) {
      this.logger.error(`Error, User List Not Found`);
      throw new Error(`User List Not Found`);
    }

    return allUsers;
  }

  async create(dto: UserCreateDto): Promise<User> {
    const createdUser = await this.userRepo.save(dto);
    if (!createdUser) {
      this.logger.error(`Error Creating User with Following Data: ${dto}`);
      throw new Error(`User Not Created with Following Data: ${dto}`);
    }

    return createdUser;
  }

  async update(id: string, dto: UserUpdateDto): Promise<User> {
    const existingUser = await this.userRepo.findOne({
      where: { id: Number(id) },
    });
    if (!existingUser) {
      this.logger.error(
        `Error, User with ID ${id} not found when attempting to update user information`,
      );
      throw new NotFoundException(
        `Error, User with ID ${id} not found when attempting to update user information`,
      );
    }

    const mergedUser = this.userRepo.merge(existingUser, dto);
    if (!mergedUser) {
      this.logger.error(
        `Error Updating User with Following Data Merge: User: ${existingUser} Provided Data: ${dto}`,
      );
      throw new Error(
        `Error Updating User with Following Data Merge: User: ${existingUser} Provided Data: ${dto}`,
      );
    }

    const updatedUser = await this.userRepo.save(mergedUser);
    if (!updatedUser) {
      this.logger.error(
        `Error Saving User When Updating: User: ${existingUser} Provided Data: ${dto}`,
      );
      throw new Error(
        `Error Saving User When Updating: User: ${existingUser} Provided Data: ${dto}`,
      );
    }

    return updatedUser;
  }

  async delete(id: string): Promise<User> {
    const userToDelete = await this.userRepo.findOne({
      where: { id: Number(id) },
    });
    if (!userToDelete) {
      this.logger.error(`Error, User with ID ${id} not found for deletion`);
      throw new NotFoundException(
        `Error, User with ID ${id} not found for deletion`,
      );
    }

    const deletedUser = await this.userRepo.delete(Number(id));
    if (!deletedUser) {
      this.logger.error(
        `Error Deleting User with ID ${id} and Data: ${userToDelete}`,
      );
      throw new Error(
        `Error Deleting User with ID ${id} and Data: ${userToDelete}`,
      );
    }

    return userToDelete;
  }
}
