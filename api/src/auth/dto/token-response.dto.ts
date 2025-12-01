import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SafeUserDto } from 'src/user/dto';

export class TokenResponseDto {
  @Expose()
  @ApiProperty()
  access_token: string;

  @Expose()
  @ApiProperty()
  refresh_token: string;

  @Expose()
  @ApiProperty({ type: () => SafeUserDto })
  user: SafeUserDto;
}
