import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserSafeResponseDto } from 'src/user/dto/user-safe-response.dto';

export class FollowSafeResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @Type(() => UserSafeResponseDto)
  @ApiProperty({ type: () => UserSafeResponseDto })
  follower: UserSafeResponseDto;

  @Expose()
  @Type(() => UserSafeResponseDto)
  @ApiProperty({ type: () => UserSafeResponseDto })
  following: UserSafeResponseDto;
}
