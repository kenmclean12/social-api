import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: number;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ type: () => Date })
  createdAt: Date;

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
  @ApiProperty({ required: false })
  phoneNumber?: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({ required: false })
  description?: string;

  @Expose()
  @ApiProperty({ required: false })
  avatarUrl?: string;
}
