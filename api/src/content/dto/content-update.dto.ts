import { PartialType } from '@nestjs/mapped-types';
import { ContentCreateDto } from './content-create.dto';

export class ContentUpdateDto extends PartialType(ContentCreateDto) {}
