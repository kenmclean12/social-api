import { convertToResponseDto } from 'src/common/utils';
import { ReactionResponseDto } from '../dto';
import { Reaction } from '../entities/reaction.entity';
import { UserResponseDto } from 'src/user/dto';

export function reactionMapper(reaction: Reaction): ReactionResponseDto {
  return convertToResponseDto(ReactionResponseDto, {
    ...reaction,
    user: convertToResponseDto(UserResponseDto, reaction.user),
    messageId: reaction.message?.id ?? undefined,
    postId: reaction.post?.id ?? undefined,
    commentId: reaction.comment?.id ?? undefined,
  });
}
