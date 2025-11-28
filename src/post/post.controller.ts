import { PostService } from './post.service';

export class PostController {
  constructor(private readonly postService: PostService) {}
}
