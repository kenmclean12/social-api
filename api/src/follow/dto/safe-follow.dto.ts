import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SafeUserDto } from 'src/user/dto';

export class SafeFollowDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @Type(() => SafeUserDto)
  @ApiProperty({ type: () => SafeUserDto })
  follower: SafeUserDto;

  @Expose()
  @Type(() => SafeUserDto)
  @ApiProperty({ type: () => SafeUserDto })
  following: SafeUserDto;
}
