import { convertToResponseDto } from 'src/common/utils';
import { FollowResponseDto } from '../dto';
import { Follow } from '../entities/follow.entity';
import { UserResponseDto } from 'src/user/dto';

export function followMapper(follow: Follow): FollowResponseDto {
  return convertToResponseDto(FollowResponseDto, {
    ...follow,
    follower: convertToResponseDto(UserResponseDto, follow.follower),
    following: convertToResponseDto(UserResponseDto, follow.following),
  });
}
