import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export type FollowAction = 'follow' | 'unfollow';

export class FollowDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  followerId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  followingId: number;
}
