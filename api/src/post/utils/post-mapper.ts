import { convertToResponseDto } from 'src/common/utils';
import { UserPost } from '../entities/user-post.entity';
import { PostResponseDto } from '../dto';
import { UserResponseDto } from 'src/user/dto';
import { CommentResponseDto } from 'src/comment/dto';
import { likeMapper } from 'src/like/utils/like-mapper';
import { reactionMapper } from 'src/reaction/utils/reaction-mapper';

export function postMapper(p: UserPost): PostResponseDto {
  return convertToResponseDto(PostResponseDto, {
    ...p,
    creator: convertToResponseDto(UserResponseDto, p.creator),
    likes: p.likes?.map((l) => likeMapper(l)),
    comments: p.comments
      ?.filter((c) => !c.parentComment)
      .map((c) => ({
        ...convertToResponseDto(CommentResponseDto, {
          ...c,
          user: convertToResponseDto(UserResponseDto, c.user),
          postId: p.id,
          parentCommentId: c.parentComment?.id ?? undefined,
          likes: c.likes?.map((l) => likeMapper(l)),
          reactions: c.reactions?.map((r) => reactionMapper(r)),
          replies: c.replies
            ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((r) =>
              convertToResponseDto(CommentResponseDto, {
                ...r,
                user: convertToResponseDto(UserResponseDto, r.user),
                postId: p.id,
                parentCommentId: c.id,
                commentId: c.id,
                likes: r.likes?.map((l) => likeMapper(l)),
                reactions: r.reactions?.map((r) => reactionMapper(r)),
              }),
            ),
        }),
      })),
    reactions: p.reactions?.map((r) => reactionMapper(r)),
  });
}
