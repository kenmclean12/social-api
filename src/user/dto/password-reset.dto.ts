import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class PasswordResetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  newPassword: string;
}
