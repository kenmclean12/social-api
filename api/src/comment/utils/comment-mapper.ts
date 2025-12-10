import { convertToResponseDto } from 'src/common/utils';
import { CommentResponseDto } from '../dto';
import { Comment } from '../entities/comment.entity';
import { UserResponseDto } from 'src/user/dto';
import { likeMapper } from 'src/like/utils/like-mapper';
import { reactionMapper } from 'src/reaction/utils/reaction-mapper';

export function commentMapper(comment: Comment): CommentResponseDto {
  return convertToResponseDto(CommentResponseDto, {
    ...comment,
    user: convertToResponseDto(UserResponseDto, comment.user),
    postId: comment.post.id,
    parentCommentId: comment.parentComment?.id,
    likes: comment.likes?.map((c) => likeMapper(c)),
    reactions: comment.reactions?.map((r) => reactionMapper(r)),
    replies: comment.replies?.map((r) => commentMapper(r)),
  });
}
