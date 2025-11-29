import { Expose, Type } from 'class-transformer';

export class UserSafeResponseDto {
  @Expose()
  id: number;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  userName: string;

  @Expose()
  age: number;

  @Expose()
  phoneNumber?: string;

  @Expose()
  email: string;

  @Expose()
  description?: string;

  @Expose()
  @Type(() => FollowResponseDto)
  followers: FollowResponseDto[];

  @Expose()
  @Type(() => FollowResponseDto)
  following: FollowResponseDto[];
}

export class FollowResponseDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserSafeResponseDto)
  follower: UserSafeResponseDto;

  @Expose()
  @Type(() => UserSafeResponseDto)
  following: UserSafeResponseDto;
}
