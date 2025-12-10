import { convertToResponseDto } from 'src/common/utils';
import { UserPost } from '../entities/user-post.entity';
import { PostResponseDto } from '../dto';
import { UserResponseDto } from 'src/user/dto';
import { likeMapper } from 'src/like/utils/like-mapper';
import { reactionMapper } from 'src/reaction/utils/reaction-mapper';
import { commentMapper } from 'src/comment/utils/comment-mapper';

export function postMapper(p: UserPost): PostResponseDto {
  return convertToResponseDto(PostResponseDto, {
    ...p,
    creator: convertToResponseDto(UserResponseDto, p.creator),
    likes: p.likes?.map((l) => likeMapper(l)),
    comments: p.comments?.map((c) => commentMapper(c)),
    reactions: p.reactions?.map((r) => reactionMapper(r)),
  });
}
