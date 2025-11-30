import { PickType } from '@nestjs/swagger';
import { CommentCreateDto } from './comment-create.dto';

export class CommentUpdateDto extends PickType(CommentCreateDto, [
  'userId',
  'content',
]) {}
