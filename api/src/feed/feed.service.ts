/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowService } from 'src/follow/follow.service';
import { PostResponseDto } from 'src/post/dto';
import { UserPost } from 'src/post/entities/user-post.entity';
import { mapPostToDto } from 'src/post/utils/post-mapper';
import { In, Repository } from 'typeorm';
import { PaginatedResponseDto } from 'src/utils';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(UserPost)
    private readonly postRepo: Repository<UserPost>,
    private readonly followService: FollowService,
  ) {}

  async getPersonalizedFeed(
    userId: number,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const skip = (page - 1) * limit;
    const following = await this.followService.findFollowingByUserId(userId);
    const followingIds = following.map((u) => u.id);

    let posts: UserPost[] = [];
    if (followingIds.length > 0) {
      posts = await this.postRepo.find({
        where: { creator: { id: In(followingIds) } },
        relations: this.getRelations(),
        order: { createdAt: 'DESC' },
      });
    }

    if (posts.length < skip + limit) {
      const remaining = skip + limit - posts.length;

      const randomRaw = await this.postRepo
        .createQueryBuilder('post')
        .select('post.id')
        .where(
          followingIds.length > 0 ? 'post.creatorId NOT IN (:...ids)' : '1=1',
          { ids: followingIds },
        )
        .orderBy('RANDOM()')
        .take(remaining)
        .getRawMany();

      const randomIds = randomRaw.map((r) => r.post_id);
      if (randomIds.length > 0) {
        const randomPosts = await this.postRepo.find({
          where: { id: In(randomIds) },
          relations: this.getRelations(),
        });
        posts = [...posts, ...randomPosts];
      }
    }

    // 4. Total posts for this feed (following + all others)
    const total = await this.postRepo.count({
      where:
        followingIds.length > 0 ? { creator: { id: In(followingIds) } } : {},
    });

    // 5. Paginate: slice for the current page
    const paginatedPosts = posts.slice(skip, skip + limit);

    return {
      data: paginatedPosts.map(mapPostToDto),
      total,
      page,
      limit,
    };
  }

  async getExploreFeed(
    filter: 'mostLiked' | 'mostReacted' | 'recent' | 'oldest' = 'recent',
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponseDto<PostResponseDto>> {
    const skip = (page - 1) * limit;

    const posts = await this.postRepo.find({
      relations: this.getRelations(),
    });

    const sorted = this.sortPosts(posts, filter);
    const total = sorted.length;

    return {
      data: sorted.slice(skip, skip + limit).map(mapPostToDto),
      total,
      page,
      limit,
    };
  }

  private getRelations() {
    return [
      'creator',
      'likes',
      'likes.user',
      'reactions',
      'reactions.user',
      'comments',
      'comments.user',
      'comments.likes',
      'comments.likes.user',
      'comments.reactions',
      'comments.reactions.user',
      'comments.parentComment',
      'comments.replies',
      'comments.replies.user',
      'comments.replies.likes',
      'comments.replies.reactions',
    ];
  }

  private sortPosts(posts: UserPost[], filter: string) {
    switch (filter) {
      case 'mostLiked':
        return posts.sort((a, b) => b.likes.length - a.likes.length);
      case 'mostReacted':
        return posts.sort((a, b) => b.reactions.length - a.reactions.length);
      case 'oldest':
        return posts.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
      case 'recent':
      default:
        return posts.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
    }
  }
}
