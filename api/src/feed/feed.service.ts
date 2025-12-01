import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowService } from 'src/follow/follow.service';
import { UserPost } from 'src/post/entities/user-post.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(UserPost)
    private readonly postRepo: Repository<UserPost>,
    private readonly followService: FollowService,
  ) {}

  async getPersonalizedFeed(userId: number, limit = 20): Promise<UserPost[]> {
    const following = await this.followService.findFollowingByUserId(userId);
    const followingIds = following.map((u) => u.id);

    let posts = await this.postRepo.find({
      where: { creator: In(followingIds) },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['creator', 'likes', 'reactions', 'comments'],
    });

    if (posts.length < limit) {
      const remaining = limit - posts.length;
      const randomPosts = await this.postRepo
        .createQueryBuilder('post')
        .where('post.creatorId NOT IN (:...ids)', { ids: followingIds })
        .orderBy('RANDOM()')
        .take(remaining)
        .getMany();

      posts = [...posts, ...randomPosts];
    }

    return posts;
  }

  async getExploreFeed(
    filter: 'mostLiked' | 'mostReacted' | 'recent' | 'oldest' = 'recent',
    limit = 20,
  ): Promise<UserPost[]> {
    const query = this.postRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.reactions', 'reactions')
      .leftJoinAndSelect('post.creator', 'creator');

    switch (filter) {
      case 'mostLiked':
        query.orderBy('COUNT(likes.id)', 'DESC');
        break;
      case 'mostReacted':
        query.orderBy('COUNT(reactions.id)', 'DESC');
        break;
      case 'recent':
        query.orderBy('post.createdAt', 'DESC');
        break;
      case 'oldest':
        query.orderBy('post.createdAt', 'ASC');
        break;
    }

    return await query.take(limit).getMany();
  }
}
