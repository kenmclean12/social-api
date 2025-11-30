import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { UserCreateDto } from './user.create.dto';
import { IsOptional, IsString } from 'class-validator';

export class UserUpdateDto extends PartialType(
  OmitType(UserCreateDto, ['password'] as const),
) {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'hijofasu8r389fh9qw80eu' })
  hashedRefreshToken?: string | null;
}
