import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPost } from './entities/user-post.entity';
import { PostCreateDto, PostResponseDto, PostUpdateDto } from './dto';
import { UserService } from 'src/user/user.service';
import { convertToResponseDto } from 'src/common/utils';
import { UserResponseDto } from 'src/user/dto';
import { LikeResponseDto } from 'src/like/dto';
import { CommentResponseDto } from 'src/comment/dto';
import { ReactionResponseDto } from 'src/reaction/dto';
@Injectable()
export class PostService {
  constructor(
    @InjectRepository(UserPost)
    private readonly postRepo: Repository<UserPost>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async findOneInternal(id: number): Promise<UserPost> {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: [
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
      ],
    });

    if (!post) {
      throw new NotFoundException(
        `No Post was found with the provided Post ID: ${id}`,
      );
    }

    return post;
  }

  async findOne(id: number): Promise<PostResponseDto> {
    const post = await this.findOneInternal(id);
    if (!post) {
      throw new NotFoundException(`No post found with the provided ID: ${id}`);
    }

    return convertToResponseDto(PostResponseDto, {
      ...post,
      creator: convertToResponseDto(UserResponseDto, post.creator),
      likes: post.likes?.map((l) => {
        return convertToResponseDto(LikeResponseDto, {
          ...l,
          userId: l.user.id,
        });
      }),
      comments: post.comments
        ?.filter((c) => !c.parentComment)
        .map((c) => {
          return convertToResponseDto(CommentResponseDto, {
            ...c,
            user: convertToResponseDto(UserResponseDto, c.user),
            postId: post.id,
            parentCommentId: c.parentComment?.id ?? undefined,
            likes: c.likes?.map((l) => {
              return convertToResponseDto(LikeResponseDto, {
                ...l,
                userId: l.user.id,
                commentId: c.id,
              });
            }),
            reactions: c.reactions?.map((r) => {
              return convertToResponseDto(ReactionResponseDto, {
                ...r,
                user: convertToResponseDto(UserResponseDto, r.user),
                commentId: c.id,
              });
            }),
            replies: c.replies?.map((r) => {
              return convertToResponseDto(CommentResponseDto, {
                ...r,
                user: convertToResponseDto(UserResponseDto, r.user),
                postId: post.id,
                parentCommentId: c.id,
                commentId: c.id,
                likes: r.likes?.map((l) => {
                  return convertToResponseDto(LikeResponseDto, {
                    ...l,
                    userId: l.user.id,
                    commentId: c.id,
                  });
                }),
                reactions: r.reactions?.map((r) => {
                  return convertToResponseDto(ReactionResponseDto, {
                    ...r,
                    user: convertToResponseDto(UserResponseDto, r.user),
                    commentId: c.id,
                  });
                }),
              });
            }),
          });
        }),
      reactions: post.reactions?.map((r) => {
        return convertToResponseDto(ReactionResponseDto, {
          ...r,
          user: convertToResponseDto(UserResponseDto, r.user),
          postId: post.id,
        });
      }),
    });
  }

  // async findByUserId(userId: number): Promise<PostResponseDto[]> {
  //   const posts = await this.postRepo.find({
  //     where: { creator: { id: userId } },
  //     relations: [
  //       'creator',
  //       'likes',
  //       'likes.user',
  //       'reactions',
  //       'reactions.user',
  //       'comments',
  //       'comments.user',
  //       'comments.likes',
  //       'comments.likes.user',
  //       'comments.reactions',
  //       'comments.reactions.user',
  //       'comments.parentComment',
  //       'comments.replies',
  //       'comments.replies.user',
  //       'comments.replies.likes',
  //       'comments.replies.reactions',
  //     ],
  //     order: { createdAt: 'DESC' },
  //   });

  //   return posts.map((p) =>
  //     convertToResponseDto(PostResponseDto, {
  //       ...p,
  //       likes: p.likes?.map((l) => {
  //         return convertToResponseDto(LikeResponseDto, {
  //           ...l,
  //           userId: l.user.id,
  //         });
  //       }),
  //       comments: p.comments
  //         ?.filter((c) => !c.parentComment)
  //         .map((c) => {
  //           return convertToResponseDto(CommentResponseDto, {
  //             ...c,
  //             user: convertToResponseDto(UserResponseDto, c.user),
  //             postId: p.id,
  //             parentCommentId: c.parentComment?.id ?? undefined,
  //             likes: c.likes?.map((l) => {
  //               return convertToResponseDto(LikeResponseDto, {
  //                 ...l,
  //                 userId: l.user.id,
  //                 commentId: c.id,
  //               });
  //             }),
  //             reactions: c.reactions?.map((r) => {
  //               return convertToResponseDto(ReactionResponseDto, {
  //                 ...r,
  //                 user: convertToResponseDto(UserResponseDto, r.user),
  //                 commentId: c.id,
  //               });
  //             }),
  //             replies: c.replies?.map((r) => {
  //               return convertToResponseDto(CommentResponseDto, {
  //                 ...r,
  //                 user: convertToResponseDto(UserResponseDto, r.user),
  //                 postId: p.id,
  //                 parentCommentId: c.id,
  //                 commentId: c.id,
  //                 likes: r.likes?.map((l) => {
  //                   return convertToResponseDto(LikeResponseDto, {
  //                     ...l,
  //                     userId: l.user.id,
  //                     commentId: c.id,
  //                   });
  //                 }),
  //                 reactions: r.reactions?.map((r) => {
  //                   return convertToResponseDto(ReactionResponseDto, {
  //                     ...r,
  //                     user: convertToResponseDto(UserResponseDto, r.user),
  //                     commentId: c.id,
  //                   });
  //                 }),
  //               });
  //             }),
  //           });
  //         }),
  //       reactions: p.reactions?.map((r) => {
  //         return convertToResponseDto(ReactionResponseDto, {
  //           ...r,
  //           user: convertToResponseDto(UserResponseDto, r.user),
  //           postId: p.id,
  //         });
  //       }),
  //     }),
  //   );
  // }

  async findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ data: PostResponseDto[]; total: number }> {
    const [posts, total] = await this.postRepo.findAndCount({
      where: { creator: { id: userId } },
      relations: [
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
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    const data = posts.map((p) =>
      convertToResponseDto(PostResponseDto, {
        ...p,
        likes: p.likes?.map((l) =>
          convertToResponseDto(LikeResponseDto, {
            ...l,
            userId: l.user.id,
          }),
        ),
        comments: p.comments
          ?.filter((c) => !c.parentComment)
          .map((c) =>
            convertToResponseDto(CommentResponseDto, {
              ...c,
              user: convertToResponseDto(UserResponseDto, c.user),
              postId: p.id,
              parentCommentId: c.parentComment?.id ?? undefined,
              likes: c.likes?.map((l) =>
                convertToResponseDto(LikeResponseDto, {
                  ...l,
                  userId: l.user.id,
                  commentId: c.id,
                }),
              ),
              reactions: c.reactions?.map((r) =>
                convertToResponseDto(ReactionResponseDto, {
                  ...r,
                  user: convertToResponseDto(UserResponseDto, r.user),
                  commentId: c.id,
                }),
              ),
              replies: c.replies?.map((r) =>
                convertToResponseDto(CommentResponseDto, {
                  ...r,
                  user: convertToResponseDto(UserResponseDto, r.user),
                  postId: p.id,
                  parentCommentId: c.id,
                  commentId: c.id,
                  likes: r.likes?.map((l) =>
                    convertToResponseDto(LikeResponseDto, {
                      ...l,
                      userId: l.user.id,
                      commentId: c.id,
                    }),
                  ),
                  reactions: r.reactions?.map((r) =>
                    convertToResponseDto(ReactionResponseDto, {
                      ...r,
                      user: convertToResponseDto(UserResponseDto, r.user),
                      commentId: c.id,
                    }),
                  ),
                }),
              ),
            }),
          ),
        reactions: p.reactions?.map((r) =>
          convertToResponseDto(ReactionResponseDto, {
            ...r,
            user: convertToResponseDto(UserResponseDto, r.user),
            postId: p.id,
          }),
        ),
      }),
    );

    return { data, total };
  }

  async create(dto: PostCreateDto): Promise<PostResponseDto> {
    const user = await this.userService.findOneInternal(dto.userId);
    const savedPost = await this.postRepo.save({ ...dto, creator: user });
    return convertToResponseDto(PostResponseDto, {
      ...savedPost,
      creator: user,
    });
  }

  async update(
    id: number,
    userId: number,
    dto: PostUpdateDto,
  ): Promise<PostResponseDto> {
    const user = await this.userService.findOneInternal(userId);
    const existingPost = await this.findOneInternal(id);
    if (existingPost.creator.id !== userId) {
      throw new UnauthorizedException('Only the creator can update the post');
    }

    const mergedPost = this.postRepo.merge(existingPost, dto);
    if (!mergedPost) {
      throw new Error(
        `Failed to merge post with provided data: ${JSON.stringify({ userId, ...dto })}`,
      );
    }

    const saved = await this.postRepo.save(mergedPost);
    return convertToResponseDto(PostResponseDto, {
      ...saved,
      creator: user,
    });
  }

  async remove(id: number, userId: number): Promise<PostResponseDto> {
    const user = await this.userService.findOneInternal(userId);
    const existingPost = await this.findOneInternal(id);
    await this.userService.findOneInternal(userId);

    if (existingPost.creator.id !== user.id) {
      throw new UnauthorizedException(`Only creator user can remove the post`);
    }

    await this.postRepo.remove(existingPost);
    return convertToResponseDto(PostResponseDto, {
      ...existingPost,
      creator: user,
    });
  }
}
