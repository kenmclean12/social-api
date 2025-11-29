import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowDto } from './dto/follow.dto';
import { UserService } from 'src/user/user.service';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { FollowSafeResponseDto } from './dto/follow-safe-response.dto';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    @Inject(forwardRef(() => UserService))
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

  async findFollowingByUserId(id: number): Promise<FollowSafeResponseDto[]> {
    const following = await this.followRepo.find({
      where: { following: { id } },
      relations: ['follower'],
    });

    if (!following) {
      throw new NotFoundException(
        `No Following Records Found for User ID: ${id}`,
      );
    }

    const result: FollowSafeResponseDto[] = [];
    for (const record of following) {
      const dto = plainToInstance(FollowSafeResponseDto, record, {
        excludeExtraneousValues: true,
      }) as FollowSafeResponseDto;
      result.push(dto);
    }

    return result;
  }

  async findFollowersByUserId(id: number): Promise<FollowSafeResponseDto[]> {
    const followers = await this.followRepo.find({
      where: { follower: { id } },
      relations: ['following'],
    });

    if (!followers) {
      throw new NotFoundException(
        `No Follower Records Found for User ID: ${id}`,
      );
    }

    const result: FollowSafeResponseDto[] = [];
    for (const record of followers) {
      const dto = plainToInstance(FollowSafeResponseDto, record, {
        excludeExtraneousValues: true,
      }) as FollowSafeResponseDto;
      result.push(dto);
    }

    return result;
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
