import { MessageService } from './message.service';

export class MessageController {
  constructor(private readonly messageService: MessageService) {}
}
