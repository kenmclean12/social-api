import { convertToResponseDto } from 'src/common/utils';
import { MessageResponseDto } from '../dto';
import { Message } from '../entities';
import { likeMapper } from 'src/like/utils/like-mapper';
import { reactionMapper } from 'src/reaction/utils/reaction-mapper';
import { UserResponseDto } from 'src/user/dto';
import { messageReadMapper } from './message-read-mapper';

export function messageMapper(message: Message): MessageResponseDto {
  return convertToResponseDto(MessageResponseDto, {
    ...message,
    sender: convertToResponseDto(UserResponseDto, message.sender),
    conversationId: message.conversation.id,
    reads: message.reads?.map((r) => messageReadMapper(r)),
    likes: message.likes?.map((l) => likeMapper(l)),
    reactions: message.reactions?.map((r) => reactionMapper(r)),
  });
}
