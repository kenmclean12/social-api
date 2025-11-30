import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LikeService } from './like.service';

@Controller('like')
@ApiTags('Like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}
}
