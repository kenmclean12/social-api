import { OmitType } from '@nestjs/swagger';
import { PostCreateDto } from './post-create.dto';

export class PostUpdateDto extends OmitType(PostCreateDto, ['userId']) {}
