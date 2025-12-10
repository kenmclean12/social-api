import { convertToResponseDto } from 'src/common/utils';
import { UserPost } from '../entities/user-post.entity';
import { PostResponseDto } from '../dto';
import { UserResponseDto } from 'src/user/dto';
import { LikeResponseDto } from 'src/like/dto';
import { CommentResponseDto } from 'src/comment/dto';
import { ReactionResponseDto } from 'src/reaction/dto';

export function mapPostToDto(p: UserPost): PostResponseDto {
  return convertToResponseDto(PostResponseDto, {
    ...p,
    creator: convertToResponseDto(UserResponseDto, p.creator),
    likes: p.likes?.map((l) =>
      convertToResponseDto(LikeResponseDto, {
        ...l,
        userId: l.user.id,
      }),
    ),
    comments: p.comments
      ?.filter((c) => !c.parentComment)
      .map((c) => ({
        ...convertToResponseDto(CommentResponseDto, {
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

          replies: c.replies
            ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((r) =>
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
      })),

    reactions: p.reactions?.map((r) =>
      convertToResponseDto(ReactionResponseDto, {
        ...r,
        user: convertToResponseDto(UserResponseDto, r.user),
        postId: p.id,
      }),
    ),
  });
}
