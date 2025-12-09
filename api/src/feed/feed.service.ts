/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentResponseDto } from 'src/comment/dto';
import { convertToResponseDto } from 'src/common/utils';
import { FollowService } from 'src/follow/follow.service';
import { LikeResponseDto } from 'src/like/dto';
import { PostResponseDto } from 'src/post/dto';
import { UserPost } from 'src/post/entities/user-post.entity';
import { PostService } from 'src/post/post.service';
import { ReactionResponseDto } from 'src/reaction/dto';
import { UserResponseDto } from 'src/user/dto';
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
        relations: [
          'creator',
          'likes',
          'likes.user',
          'reactions',
          'reactions.user',
          'comments',
          'comments.user',
          'comments.parentComment',
        ],
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
          relations: [
            'creator',
            'likes',
            'likes.user',
            'reactions',
            'reactions.user',
            'comments',
            'comments.user',
            'comments.parentComment',
          ],
        });
        posts = [...posts, ...randomPosts];
      }
    }

    return posts.map((p) =>
      convertToResponseDto(PostResponseDto, {
        ...p,
        creator: convertToResponseDto(UserResponseDto, p.creator),
        likes: p.likes?.map((l) => {
          return convertToResponseDto(LikeResponseDto, {
            ...l,
            userId: l.user.id,
          });
        }),
        comments: p.comments?.map((c) => {
          return convertToResponseDto(CommentResponseDto, {
            ...c,
            user: convertToResponseDto(UserResponseDto, c.user),
            postId: p.id,
            parentCommentId: c.parentComment?.id ?? undefined,
          });
        }),
        reactions: p.reactions?.map((r) => {
          return convertToResponseDto(ReactionResponseDto, {
            ...r,
            user: convertToResponseDto(UserResponseDto, r.user),
            postId: p.id,
          });
        }),
      }),
    );
  }

  async getExploreFeed(
    filter: 'mostLiked' | 'mostReacted' | 'recent' | 'oldest' = 'recent',
    limit = 20,
  ): Promise<PostResponseDto[]> {
    const posts = await this.postRepo.find({
      relations: [
        'creator',
        'likes',
        'likes.user',
        'reactions',
        'reactions.user',
        'comments',
        'comments.user',
        'comments.parentComment',
      ],
    });

    let sortedPosts: UserPost[] = [];

    switch (filter) {
      case 'mostLiked':
        sortedPosts = posts.sort((a, b) => b.likes.length - a.likes.length);
        break;
      case 'mostReacted':
        sortedPosts = posts.sort(
          (a, b) => b.reactions.length - a.reactions.length,
        );
        break;
      case 'recent':
        sortedPosts = posts.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        );
        break;
      case 'oldest':
        sortedPosts = posts.sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        );
        break;
    }

    return sortedPosts.slice(0, limit).map((p) =>
      convertToResponseDto(PostResponseDto, {
        ...p,
        creator: convertToResponseDto(UserResponseDto, p.creator),
        likes: p.likes?.map((l) => {
          return convertToResponseDto(LikeResponseDto, {
            ...l,
            userId: l.user.id,
          });
        }),
        comments: p.comments?.map((c) => {
          return convertToResponseDto(CommentResponseDto, {
            ...c,
            user: convertToResponseDto(UserResponseDto, c.user),
            postId: p.id,
            parentCommentId: c.parentComment?.id ?? undefined,
          });
        }),
        reactions: p.reactions?.map((r) => {
          return convertToResponseDto(ReactionResponseDto, {
            ...r,
            user: convertToResponseDto(UserResponseDto, r.user),
            postId: p.id,
          });
        }),
      }),
    );
  }
}
