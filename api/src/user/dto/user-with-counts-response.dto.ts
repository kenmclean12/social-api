import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserWithCountsResponseDto extends User {
  @ApiProperty()
  followingCount: number;

  @ApiProperty()
  followerCount: number;
}
