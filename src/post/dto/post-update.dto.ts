import { PartialType } from '@nestjs/swagger';
import { PostCreateDto } from './post-create.dto';

export class PostUpdateDto extends PartialType(PostCreateDto) {}
