import { Follow } from './entities/follow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FollowDto, SafeFollowDto } from './dto';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationType } from 'src/notification/entities/notification.entity';
import { convertToResponseDto } from 'src/common/utils';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {}

  async findOneInternal(id: number): Promise<Follow> {
    const follow = await this.followRepo.findOne({
      where: { id },
      relations: ['follower', 'following'],
    });

    if (!follow) {
      throw new NotFoundException(`Follow record with ID ${id} not found`);
    }

    return follow;
  }

  async findFollowingByUserId(id: number): Promise<SafeFollowDto[]> {
    const following = await this.followRepo.find({
      where: { follower: { id } },
      relations: ['following'],
      order: { createdAt: 'ASC' },
    });

    return following.map((f) => convertToResponseDto(SafeFollowDto, f));
  }

  async findFollowersByUserId(id: number): Promise<SafeFollowDto[]> {
    const followers = await this.followRepo.find({
      where: { following: { id } },
      relations: ['follower'],
      order: { createdAt: 'ASC' },
    });

    if (!followers) {
      throw new NotFoundException(
        `No Follower Records Found for User ID: ${id}`,
      );
    }

    return followers.map((f) => convertToResponseDto(SafeFollowDto, f));
  }

  async create({ followerId, followingId }: FollowDto): Promise<SafeFollowDto> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const existingFollow = await this.followRepo.findOne({
      where: { follower: { id: followerId }, following: { id: followingId } },
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this user');
    }

    const follower = await this.userService.findOneInternal(followerId);
    const following = await this.userService.findOneInternal(followingId);
    const saved = await this.followRepo.save({ follower, following });
    const full = await this.findOneInternal(saved.id);

    const existingNotification = await this.notificationService.findOneInternal(
      followingId,
      followerId,
      NotificationType.FOLLOW,
    );

    if (!existingNotification) {
      await this.notificationService.create({
        recipientId: followingId,
        actorId: followerId,
        type: NotificationType.FOLLOW,
      });
    }

    return convertToResponseDto(SafeFollowDto, full);
  }

  async remove(id: number, userId: number): Promise<SafeFollowDto> {
    const follow = await this.findOneInternal(id);

    if (follow.follower.id !== userId && follow.following.id !== userId) {
      throw new UnauthorizedException(
        'Only the follower or user being followed can remove a follow',
      );
    }

    await this.followRepo.remove(follow);
    return convertToResponseDto(SafeFollowDto, follow);
  }
}
