import { convertToResponseDto } from 'src/common/utils';
import { LikeResponseDto } from '../dto';
import { Like } from '../entities/like.entity';
import { UserResponseDto } from 'src/user/dto';

export function likeMapper(like: Like): LikeResponseDto {
  return convertToResponseDto(LikeResponseDto, {
    ...like,
    userId: convertToResponseDto(UserResponseDto, like.user.id),
    messageId: like.message?.id,
    postId: like.post?.id,
    commentId: like.comment?.id,
  });
}
