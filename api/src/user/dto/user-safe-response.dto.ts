import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UserSafeResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  userName: string;

  @Expose()
  @ApiProperty()
  age: number;

  @Expose()
  @ApiProperty()
  phoneNumber?: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  description?: string;

  @Expose()
  @Type(() => FollowResponseDto)
  @ApiProperty()
  followers: FollowResponseDto[];

  @Expose()
  @Type(() => FollowResponseDto)
  @ApiProperty()
  following: FollowResponseDto[];
}

export class FollowResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @Type(() => UserSafeResponseDto)
  @ApiProperty()
  follower: UserSafeResponseDto;

  @Expose()
  @Type(() => UserSafeResponseDto)
  @ApiProperty()
  following: UserSafeResponseDto;
}
