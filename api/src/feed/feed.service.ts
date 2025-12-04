/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowService } from 'src/follow/follow.service';
import { PostResponseDto } from 'src/post/dto';
import { UserPost } from 'src/post/entities/user-post.entity';
import { PostService } from 'src/post/post.service';
import { In, Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(UserPost)
    private readonly postRepo: Repository<UserPost>,
    private readonly postService: PostService,
    private readonly followService: FollowService,
  ) {}

  async getPersonalizedFeed(
    userId: number,
    limit = 20,
  ): Promise<PostResponseDto[]> {
    const following = await this.followService.findFollowingByUserId(userId);
    const followingIds = following.map((u) => u.id);

    let posts: UserPost[] = [];

    if (followingIds.length > 0) {
      posts = await this.postRepo.find({
        where: { creator: In(followingIds) },
        order: { createdAt: 'DESC' },
        take: limit,
        relations: ['creator', 'likes', 'reactions', 'comments'],
      });
    }

    if (posts.length < limit) {
      const remaining = limit - posts.length;
      const randomPostIds = await this.postRepo
        .createQueryBuilder('post')
        .select('post.id')
        .where(
          followingIds.length > 0 ? 'post.creatorId NOT IN (:...ids)' : '1=1',
          { ids: followingIds },
        )
        .orderBy('RANDOM()')
        .take(remaining)
        .getRawMany();

      const ids = randomPostIds.map((r) => r.post_id);

      if (ids.length > 0) {
        const randomPosts = await this.postRepo.find({
          where: { id: In(ids) },
          relations: ['creator', 'likes', 'reactions', 'comments'],
        });
        posts = [...posts, ...randomPosts];
      }
    }

    return posts.map((p) => this.postService.toResponseDto(p));
  }

  async getExploreFeed(
    filter: 'mostLiked' | 'mostReacted' | 'recent' | 'oldest' = 'recent',
    limit = 20,
  ): Promise<PostResponseDto[]> {
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

    const posts = await query.take(limit).getMany();

    return posts.map((p) => this.postService.toResponseDto(p));
  }
}
