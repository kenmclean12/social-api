import { convertToResponseDto } from 'src/common/utils';
import { MessageReadResponseDto } from '../dto';
import { MessageRead } from '../entities';
import { UserResponseDto } from 'src/user/dto';

export function messageReadMapper(read: MessageRead): MessageReadResponseDto {
  return convertToResponseDto(MessageReadResponseDto, {
    ...read,
    messageId: read.message.id,
    user: convertToResponseDto(UserResponseDto, read.user.id),
  });
}
