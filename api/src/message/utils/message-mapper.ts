import { convertToResponseDto } from 'src/common/utils';
import { MessageResponseDto } from '../dto';
import { Message } from '../entities';
import { likeMapper } from 'src/like/utils/like-mapper';

export function messageMapper(message: Message): MessageResponseDto {
  return convertToResponseDto(MessageResponseDto, {
    ...message,
    likes: message.likes?.map((l) => likeMapper(l)),
  });
}
