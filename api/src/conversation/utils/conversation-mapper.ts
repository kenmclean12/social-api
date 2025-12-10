import { convertToResponseDto } from 'src/common/utils';
import { ConversationResponseDto } from '../dto';
import { Conversation } from '../entities/conversation.entity';
import { UserResponseDto } from 'src/user/dto';

export function conversationMapper(
  conversation: Conversation,
): ConversationResponseDto {
  return convertToResponseDto(ConversationResponseDto, {
    ...conversation,
    initiator: convertToResponseDto(UserResponseDto, conversation.initiator),
    participants: convertToResponseDto(
      UserResponseDto,
      conversation.participants,
    ),
  });
}
