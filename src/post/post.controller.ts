import { ApiTags } from '@nestjs/swagger';
import { PostService } from './post.service';
import { Controller } from '@nestjs/common';

@Controller('post')
@ApiTags('Post')
export class PostController {
  constructor(private readonly postService: PostService) {}
}
