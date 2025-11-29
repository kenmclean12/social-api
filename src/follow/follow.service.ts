import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowDto } from './dto/follow.dto';
import { UserService } from 'src/user/user.service';
import { NotFoundException } from '@nestjs/common';

export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    private readonly userService: UserService,
  ) {}

  async findFollow({ followerId, followingId }: FollowDto): Promise<Follow> {
    const follower = await this.userService.findOne(followerId);
    const following = await this.userService.findOne(followingId);

    const follow = await this.followRepo.findOne({
      where: { follower: { id: follower.id }, following: { id: following.id } },
    });

    if (!follow) {
      throw new NotFoundException(
        `Follow relationship not found between follower ID ${followerId} and following ID ${followingId}`,
      );
    }

    return follow;
  }

  async createFollow({ followerId, followingId }: FollowDto): Promise<Follow> {
    const follower = await this.userService.findOne(followerId);
    const following = await this.userService.findOne(followingId);
    return await this.followRepo.save({ follower, following });
  }

  async removeFollow({ followerId, followingId }: FollowDto): Promise<Follow> {
    const follow = await this.findFollow({ followerId, followingId });
    return await this.followRepo.remove(follow);
  }
}
