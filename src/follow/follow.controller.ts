import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FollowService } from './follow.service';

@Controller('follow')
@ApiTags('Follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}
}
