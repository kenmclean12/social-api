import { OmitType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class SafeUserDto extends OmitType(User, ['hashedPassword']) {}
