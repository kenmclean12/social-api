import { Controller } from '@nestjs/common';
import { ConversationService } from './conversation.service';

@Controller()
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}
}
