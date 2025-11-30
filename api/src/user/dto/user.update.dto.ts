import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { UserCreateDto } from './user.create.dto';

export class UserUpdateDto extends PartialType(
  OmitType(UserCreateDto, ['password'] as const),
) {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'hijofasu8r389fh9qw80eu' })
  hashedRefreshToken?: string | null;
}
