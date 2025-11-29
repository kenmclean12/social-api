import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowDto } from './dto/follow.dto';
import { UserService } from 'src/user/user.service';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FollowSafeResponseDto } from './dto/follow-safe-response.dto';

export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    private readonly userService: UserService,
  ) {}

  async findOne(id: number): Promise<Follow> {
    const follow = await this.followRepo.findOne({ where: { id } });
    if (!follow) {
      throw new NotFoundException(`Follow record with ID ${id} not found`);
    }

    return follow;
  }

  async findOneWithRelations(id: number): Promise<FollowSafeResponseDto> {
    const follow = await this.followRepo.findOne({
      where: { id },
      relations: ['follower', 'following'],
    });

    if (!follow) {
      throw new NotFoundException(`Follow record with ID ${id} not found`);
    }

    return plainToInstance(FollowSafeResponseDto, follow, {
      excludeExtraneousValues: true,
    }) as FollowSafeResponseDto;
  }

  async create({ followerId, followingId }: FollowDto): Promise<Follow> {
    const follower = await this.userService.findOne(followerId);
    const following = await this.userService.findOne(followingId);
    return await this.followRepo.save({ follower, following });
  }

  async remove(id: number): Promise<Follow> {
    const follow = await this.findOne(id);
    return await this.followRepo.remove(follow);
  }
}
