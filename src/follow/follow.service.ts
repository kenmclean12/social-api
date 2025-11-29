import { Logger } from '@nestjs/common';
import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowDto } from './dto/follow.dto';
import { UserService } from 'src/user/user.service';

export class FollowService {
  private readonly logger: Logger;
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    private readonly userService: UserService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  async createFollow({ followerId, followingId }: FollowDto): Promise<Follow> {
    const follower = await this.userService.findOne(String(followerId));
    const following = await this.userService.findOne(String(followingId));
    const follow = await this.followRepo.save({ follower, following });
    return follow;
  }

  async removeFollow({ followerId, followingId }: FollowDto): Promise<Follow> {
    const follower = await this.userService.findOne(String(followerId));
    const following = await this.userService.findOne(String(followingId));
    const follow = await this.followRepo.findOne({
      where: { follower: { id: follower.id }, following: { id: following.id } },
    });
    if (!follow) {
      this.logger.error(
        `Error, Follow relationship not found between follower ID ${followerId} and following ID ${followingId}`,
      );
      throw new Error(
        `Error, Follow relationship not found between follower ID ${followerId} and following ID ${followingId}`,
      );
    }
    const deletedFollow = await this.followRepo.remove(follow);
    return deletedFollow;
  }
}
