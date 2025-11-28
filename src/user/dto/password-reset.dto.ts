import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class PasswordResetDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  newPassword: string;
}
